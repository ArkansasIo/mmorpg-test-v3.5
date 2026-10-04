/**
 * Win64 PE executable generator for the BSAT launcher toolchain.
 *
 * The generated binaries are small native launchers. They invoke the matching
 * batch file with WinExec and then terminate through ExitProcess. This keeps
 * the launcher dependency-free; the actual Node.js/TypeScript toolchain still
 * runs from the project directory on Windows.
 */

const fs = require("fs");
const path = require("path");

const FILE_ALIGNMENT = 0x200;
const SECTION_ALIGNMENT = 0x1000;
const HEADERS_SIZE = 0x400;
const TEXT_RVA = 0x1000;
const RDATA_RVA = 0x2000;
const IMAGE_BASE = 0x140000000n;

function align(value, alignment) {
  return Math.ceil(value / alignment) * alignment;
}

function writeSectionHeader(buffer, offset, name, virtualSize, virtualAddress, rawSize, rawPointer, characteristics) {
  buffer.write(name.padEnd(8, "\0").slice(0, 8), offset, "ascii");
  buffer.writeUInt32LE(virtualSize, offset + 8);
  buffer.writeUInt32LE(virtualAddress, offset + 12);
  buffer.writeUInt32LE(rawSize, offset + 16);
  buffer.writeUInt32LE(rawPointer, offset + 20);
  buffer.writeUInt32LE(0, offset + 24); // relocation pointer
  buffer.writeUInt32LE(0, offset + 28); // line-number pointer
  buffer.writeUInt16LE(0, offset + 32); // relocations
  buffer.writeUInt16LE(0, offset + 34); // line numbers
  buffer.writeUInt32LE(characteristics, offset + 36);
}

function buildLauncherCode() {
  // Win64 calling convention: RCX = command string, EDX = show mode.
  // RIP-relative displacements are calculated from the next instruction.
  const code = Buffer.from([
    0x48, 0x83, 0xec, 0x28,                         // sub rsp, 28h
    0x48, 0x8d, 0x0d, 0x25, 0x10, 0x00, 0x00,       // lea rcx, [rip + 1025h] -> RVA 2030h
    0xba, 0x01, 0x00, 0x00, 0x00,                   // mov edx, 1 (SW_SHOWNORMAL)
    0xff, 0x15, 0x3a, 0x10, 0x00, 0x00,             // call [rip + 103Ah] -> RVA 2050h
    0x31, 0xc9,                                     // xor ecx, ecx
    0xff, 0x15, 0x3a, 0x10, 0x00, 0x00,             // call [rip + 103Ah] -> RVA 2058h
    0x48, 0x83, 0xc4, 0x28,                         // add rsp, 28h
    0xc3,                                           // ret
  ]);

  if (code.length > FILE_ALIGNMENT) {
    throw new Error("Launcher code exceeds the .text section size");
  }
  return code;
}

function createWin64Exe(commandToExecute, outputPath) {
  if (!commandToExecute || commandToExecute.includes("\0")) {
    throw new Error("Launcher command must be a non-empty string without NUL bytes");
  }

  const dosHeader = Buffer.alloc(0x80);
  dosHeader.write("MZ", 0, "ascii");
  dosHeader.writeUInt32LE(0x80, 0x3c); // PE signature offset
  dosHeader.write("This program cannot be run in DOS mode.\r\n$", 0x40, "ascii");

  const peSignature = Buffer.from("PE\0\0", "binary");
  const coffHeader = Buffer.alloc(20);
  coffHeader.writeUInt16LE(0x8664, 0); // IMAGE_FILE_MACHINE_AMD64
  coffHeader.writeUInt16LE(2, 2); // .text and .rdata
  coffHeader.writeUInt32LE(Math.floor(Date.now() / 1000), 4);
  coffHeader.writeUInt32LE(0, 8); // symbol table pointer
  coffHeader.writeUInt32LE(0, 12); // symbol count
  coffHeader.writeUInt16LE(240, 16); // PE32+ optional header size
  coffHeader.writeUInt16LE(0x0022, 18); // executable + large-address-aware

  const optionalHeader = Buffer.alloc(240);
  optionalHeader.writeUInt16LE(0x020b, 0); // PE32+
  optionalHeader.writeUInt8(14, 2); // linker version
  optionalHeader.writeUInt32LE(FILE_ALIGNMENT, 4); // code size
  optionalHeader.writeUInt32LE(FILE_ALIGNMENT, 8); // initialized data size
  optionalHeader.writeUInt32LE(TEXT_RVA, 16); // entry point
  optionalHeader.writeUInt32LE(TEXT_RVA, 20); // base of code
  optionalHeader.writeBigUInt64LE(IMAGE_BASE, 24);
  optionalHeader.writeUInt32LE(SECTION_ALIGNMENT, 32);
  optionalHeader.writeUInt32LE(FILE_ALIGNMENT, 36);
  optionalHeader.writeUInt16LE(6, 40); // OS version 6.0+
  optionalHeader.writeUInt16LE(0, 42);
  optionalHeader.writeUInt16LE(6, 48); // subsystem version 6.0+
  optionalHeader.writeUInt32LE(align(RDATA_RVA + FILE_ALIGNMENT, SECTION_ALIGNMENT), 56); // image size
  optionalHeader.writeUInt32LE(HEADERS_SIZE, 60); // headers size
  optionalHeader.writeUInt32LE(0, 64); // checksum; not required for this launcher
  optionalHeader.writeUInt16LE(3, 68); // console subsystem
  optionalHeader.writeUInt16LE(0x8100, 70); // NX_COMPAT | TERMINAL_SERVER_AWARE; no relocations are emitted
  optionalHeader.writeBigUInt64LE(0x100000n, 72); // stack reserve
  optionalHeader.writeBigUInt64LE(0x1000n, 80); // stack commit
  optionalHeader.writeBigUInt64LE(0x100000n, 88); // heap reserve
  optionalHeader.writeBigUInt64LE(0x1000n, 96); // heap commit
  optionalHeader.writeUInt32LE(16, 108); // data-directory count
  optionalHeader.writeUInt32LE(RDATA_RVA, 120); // import directory RVA
  optionalHeader.writeUInt32LE(0x28, 124); // import directory size

  const sectionHeaders = Buffer.alloc(80);
  writeSectionHeader(sectionHeaders, 0, ".text", FILE_ALIGNMENT, TEXT_RVA, FILE_ALIGNMENT, HEADERS_SIZE, 0x60000020);
  writeSectionHeader(sectionHeaders, 40, ".rdata", FILE_ALIGNMENT, RDATA_RVA, FILE_ALIGNMENT, HEADERS_SIZE + FILE_ALIGNMENT, 0x40000040);

  const headers = Buffer.alloc(HEADERS_SIZE);
  let offset = 0;
  dosHeader.copy(headers, offset); offset += dosHeader.length;
  peSignature.copy(headers, offset); offset += peSignature.length;
  coffHeader.copy(headers, offset); offset += coffHeader.length;
  optionalHeader.copy(headers, offset); offset += optionalHeader.length;
  sectionHeaders.copy(headers, offset);

  const textRaw = Buffer.alloc(FILE_ALIGNMENT);
  buildLauncherCode().copy(textRaw);

  const rdataRaw = Buffer.alloc(FILE_ALIGNMENT);
  // Import descriptor at RVA 2000h.
  rdataRaw.writeUInt32LE(0x2040, 0);
  rdataRaw.writeUInt32LE(0, 4);
  rdataRaw.writeUInt32LE(0, 8);
  rdataRaw.writeUInt32LE(0x2070, 12); // DLL name
  rdataRaw.writeUInt32LE(0x2050, 16); // IAT

  // Import lookup table and IAT.
  rdataRaw.writeBigUInt64LE(0x2080n, 0x40);
  rdataRaw.writeBigUInt64LE(0x2090n, 0x48);
  rdataRaw.writeBigUInt64LE(0n, 0x50);
  rdataRaw.writeBigUInt64LE(0x2080n, 0x50);
  rdataRaw.writeBigUInt64LE(0x2090n, 0x58);
  rdataRaw.writeBigUInt64LE(0n, 0x60);

  rdataRaw.write("KERNEL32.dll\0", 0x70, "ascii");
  rdataRaw.writeUInt16LE(0, 0x80);
  rdataRaw.write("WinExec\0", 0x82, "ascii");
  rdataRaw.writeUInt16LE(0, 0x90);
  rdataRaw.write("ExitProcess\0", 0x92, "ascii");
  rdataRaw.write(`${commandToExecute}\0`, 0x30, "ascii");

  const fullExe = Buffer.concat([headers, textRaw, rdataRaw]);
  fs.mkdirSync(path.dirname(outputPath), { recursive: true });
  fs.writeFileSync(outputPath, fullExe);
  console.log(`[OK] Generated ${path.relative(process.cwd(), outputPath)} (${fullExe.length} bytes)`);
}

function generateAll() {
  const rootDir = path.resolve(__dirname, "..");
  const targets = [
    ["install-setup.exe", "cmd.exe /k install-setup.bat"],
    ["env-config.exe", "cmd.exe /k env-config.bat"],
    ["launch-fullstack.exe", "cmd.exe /k start-fullstack.bat"],
    ["universe-server.exe", "cmd.exe /k start-server.bat"],
    ["universe-client.exe", "cmd.exe /k npm run dev"],
    ["bsat-studio.exe", "cmd.exe /k start-server.bat"],
    ["bsat-compiler.exe", "cmd.exe /k compile-and-run.bat"],
    ["bsat-supervisor.exe", "cmd.exe /k dev-watch.bat"],
  ];

  console.log("====================================================");
  console.log("GENERATING BSAT STANDALONE WINDOWS EXE BINARIES");
  console.log("====================================================");

  for (const [filename, command] of targets) {
    for (const directory of [rootDir, path.join(rootDir, "public"), path.join(rootDir, "dist-exe")]) {
      createWin64Exe(command, path.join(directory, filename));
    }
  }

  console.log("====================================================");
  console.log("Executable artifacts generated in root/, public/, and dist-exe/.");
  console.log("====================================================");
}

generateAll();
