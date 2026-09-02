const fs = require('fs');
const files = ['src/pages/Login.jsx', 'src/pages/Register.jsx', 'src/pages/ForgotPassword.jsx'];
for (let file of files) {
  let content = fs.readFileSync(file, 'utf-8');
  content = content.replace(/max-w-7xl mx-auto px-4 sm:px-6 lg:px-8/g, 'max-w-[1400px] mx-auto px-6 sm:px-10 lg:px-[10%]');
  content = content.replace(/lg:w-5\/12/g, 'lg:w-[460px]');
  content = content.replace(/bg-surface-900\/40 backdrop-blur-xl p-8 sm:p-10 shadow-2xl rounded-3xl border border-white\/10 text-white/g, 'bg-[#1e1f26]/85 backdrop-blur-xl p-8 sm:p-10 rounded-[24px] border border-white/10 shadow-2xl text-white');
  content = content.replace(/bg-surface-800\/50/g, 'bg-[#121318]/50');
  content = content.replace(/bg-primary-600 hover:bg-primary-500/g, 'bg-[#5c4dff] hover:bg-[#4a3ddf]');
  content = content.replace(/text-primary-500/g, 'text-[#5c4dff]');
  content = content.replace(/text-primary-400/g, 'text-[#5c4dff]');
  content = content.replace(/ring-primary-500/g, 'ring-[#5c4dff]');
  content = content.replace(/shadow-primary-500\/25/g, 'shadow-[#5c4dff]/25');
  
  // Custom replacements for right side
  const rightSideIndex = content.indexOf('{/* Right side: Typography/Branding */}');
  if (rightSideIndex !== -1) {
    const endOfFileIndex = content.lastIndexOf('</div>\r\n    </div>\r\n  );\r\n};');
    const endOfFileIndexLF = content.lastIndexOf('</div>\n    </div>\n  );\n};');
    const endIdx = endOfFileIndex !== -1 ? endOfFileIndex : endOfFileIndexLF;
    
    if (endIdx !== -1 && endIdx > rightSideIndex) {
      content = content.substring(0, rightSideIndex) + '        {/* Right side: Empty */}\n        <div className="hidden lg:flex flex-1"></div>\n      ' + content.substring(endIdx);
    }
  }
  
  fs.writeFileSync(file, content);
}
console.log('Done replacing sizing and layout');
