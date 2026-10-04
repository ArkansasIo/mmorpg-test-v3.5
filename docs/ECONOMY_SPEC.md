# Economy & Colonial Maintenance Specification

## 1. Natural Turn Income Formula
$$\text{Net Natural Base} = \max\Big(0, (U \times 20) + ((M + L) \times 80) + \sum \text{Tribute}(p) - \sum \text{Maintenance}(p)\Big)$$
$$\text{Final Turn Income} = \text{Net Natural Base} \times \text{RaceMultiplier} \times \text{DEFCONMultiplier}$$

## 2. Maintenance Breakdown Pillars
- **Civil Administration**: 35%
- **Interstellar Logistics**: 25%
- **Life Support Sustenance**: 20%
- **Garrison Security**: 20%

## 3. Expansion Efficiency Thresholds
- **Optimal ( $\ge 65\%$ Margin)**: Thriving surplus, low logistical overhead.
- **Sustainable ($45\% - 64\%$ Margin)**: Healthy economy, steady colonial growth.
- **Strained ($25\% - 44\%$ Margin)**: Rapid expansion creating high logistical overhead.
- **Over-Extended ($< 25\%$ Margin)**: Severe deficit risk; requires immediate workforce or specialization mitigation.
