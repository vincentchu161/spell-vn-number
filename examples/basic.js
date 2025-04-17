// Import the spell function
import { spell, spellVnNumber, SpellerConfig } from '../dist/esm/index.js';

// Basic usage
console.log('Basic usage:');
console.log(spell('0'), '→', 'không');
console.log(spell('123'), '→', 'một trăm hai mươi ba');
console.log(spell('1,234'), '→', 'một nghìn hai trăm ba mươi bốn');

// Special cases
console.log('\nSpecial cases:');
console.log(spell('101'), '→', 'một trăm lẻ một');
console.log(spell('115'), '→', 'một trăm mười lăm');
console.log(spell('21'), '→', 'hai mươi mốt');
console.log(spell('24'), '→', 'hai mươi tư');
console.log(spell('25'), '→', 'hai mươi lăm');

// Negative numbers
console.log('\nNegative numbers:');
console.log(spell('-1234'), '→', 'âm một nghìn hai trăm ba mươi bốn');

// Decimal numbers
console.log('\nDecimal numbers:');
console.log(spell('123.45'), '→', 'một trăm hai mươi ba chấm bốn mươi lăm');

// Large numbers
console.log('\nLarge numbers:');
console.log(spell('1,000,000,000'), '→', 'một tỷ');
console.log(spell('1,234,567,890'), '→', 'một tỷ hai trăm ba mươi bốn triệu năm trăm sáu mươi bảy nghìn tám trăm chín mươi');

// Custom configuration
console.log('\nCustom configuration:');
const customConfig = new SpellerConfig({
  separator: '-',
  pointText: 'phẩy',
});

console.log(spellVnNumber(customConfig, '123.45'), '→', 'một-trăm-hai-mươi-ba-phẩy-bốn-mươi-lăm');

// Examples from the original code
console.log('\nExamples from the original code:');
console.log(spell('110,000,031,000,001'), '→', 'một trăm mười nghìn tỷ không trăm ba mươi mốt triệu không trăm lẻ một');
console.log(spell('1,111,105'), '→', 'một triệu một trăm mười một nghìn một trăm lẻ năm');
console.log(spell('1,111,115'), '→', 'một triệu một trăm mười một nghìn một trăm mười lăm'); 