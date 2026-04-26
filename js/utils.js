// ==========================================
// 1. ระบบโหลดฟอนต์ทั้งหมด (รองรับ 72 รายการ)
// ==========================================
function loadFonts() {
    const fonts = [
        // --- 1. กลุ่ม Bangkok (8 รายการ) ---
        new FontFace('BangkokMoneyBold', 'url(assets/fonts/Bangkok-Money-Bold.woff)'),
        new FontFace('BangkokMoneyMedium', 'url(assets/fonts/Bangkok-Money-Medium.woff)'),
        new FontFace('BangkokMoneyRegular', 'url(assets/fonts/Bangkok-Money-Regular.woff)'),
        new FontFace('BangkokMoneySemiBold', 'url(assets/fonts/Bangkok-Money-SemiBold.woff)'),
        new FontFace('BangkokMoney', 'url(assets/fonts/Bangkok-Money.woff)'),
        new FontFace('BangkokTime', 'url(assets/fonts/Bangkok-Time.woff)'),
        new FontFace('BangkokTime1', 'url(assets/fonts/Bangkok-Time1.woff)'),
        new FontFace('BangkokTime2', 'url(assets/fonts/Bangkok-Time2.woff)'),

        // --- 2. กลุ่ม Core Sans (2 รายการ) ---
        new FontFace('CoreSansLight', 'url(assets/fonts/Core-Sans-E-W01-35-Light.woff)'),
        new FontFace('CoreSansBold', 'url(assets/fonts/Core-Sans-N-65-Bold.woff)'),

        // --- 3. กลุ่ม DB HelvethaicaMon X (7 รายการ) ---
        new FontFace('DBHelvethaicaMonXBold', 'url(assets/fonts/DBHelvethaicaMonXBd.woff)'),
        new FontFace('DBHelvethaicaMonXBoldCond', 'url(assets/fonts/DBHelvethaicaMonXBdCond.woff)'),
        new FontFace('DBHelvethaicaMonXBlk', 'url(assets/fonts/DBHelvethaicaMonXBlk.woff)'),
        new FontFace('DBHelvethaicaMonXCond', 'url(assets/fonts/DBHelvethaicaMonXCond.woff)'),
        new FontFace('DBHelvethaicaMonXMed', 'url(assets/fonts/DBHelvethaicaMonXMed.woff)'),
        new FontFace('DBHelvethaicaMonXMedCond', 'url(assets/fonts/DBHelvethaicaMonXMedCond.woff)'),
        new FontFace('DBHelvethaicaMonX', 'url(assets/fonts/DBHelvethaicaMonX.woff)'),

        // --- 4. กลุ่ม DX (8 รายการ) ---
        new FontFace('DXKrungthaiBold', 'url(assets/fonts/DX-Krungthai-Bold.woff)'),
        new FontFace('DXKrungthaiMedium', 'url(assets/fonts/DX-Krungthai-Medium.woff)'),
        new FontFace('DXKrungthaiRegular', 'url(assets/fonts/DX-Krungthai-Regular.woff)'),
        new FontFace('DXKrungthaiSemiBold', 'url(assets/fonts/DX-Krungthai-SemiBold.woff)'),
        new FontFace('DXKrungthaiThin', 'url(assets/fonts/DX-Krungthai-Thin.woff)'),
        new FontFace('DXSCB', 'url(assets/fonts/DX-SCB.woff)'),
        new FontFace('DXTTBBold', 'url(assets/fonts/DX-TTB-bold.woff)'),
        new FontFace('DXTTBRegular', 'url(assets/fonts/DX-TTB-regular.woff)'),

        // --- 5. กลุ่ม Kanit (9 รายการ) ---
        new FontFace('KanitBlack', 'url(assets/fonts/Kanit-Black.woff)'),
        new FontFace('KanitBold', 'url(assets/fonts/Kanit-Bold.woff)'),
        new FontFace('KanitExtraBold', 'url(assets/fonts/Kanit-ExtraBold.woff)'),
        new FontFace('KanitExtraLight', 'url(assets/fonts/Kanit-ExtraLight.woff)'),
        new FontFace('KanitLight', 'url(assets/fonts/Kanit-Light.woff)'),
        new FontFace('KanitMedium', 'url(assets/fonts/Kanit-Medium.woff)'),
        new FontFace('KanitRegular', 'url(assets/fonts/Kanit-Regular.woff)'),
        new FontFace('KanitSemiBold', 'url(assets/fonts/Kanit-SemiBold.woff)'),
        new FontFace('KanitThin', 'url(assets/fonts/Kanit-Thin.woff)'),

        // --- 6. กลุ่ม Krungsri (3 รายการ) ---
        new FontFace('krungsriBold', 'url(assets/fonts/krungsri_con_bol-webfont.woff)'),
        new FontFace('krungsriMedium', 'url(assets/fonts/krungsri_con_med-webfont.woff)'),
        new FontFace('krungsriRegular', 'url(assets/fonts/krungsri_con-webfont.woff)'),

        // --- 7. กลุ่ม SF Thonburi (4 รายการ) ---
        new FontFace('SFThonburiBold', 'url(assets/fonts/SFThonburi-Bold.woff)'),
        new FontFace('SFThonburiRegular', 'url(assets/fonts/SFThonburi-Regular.woff)'),
        new FontFace('SFThonburiSemiBold', 'url(assets/fonts/SFThonburi-Semibold.woff)'),
        new FontFace('SFThonburiLight', 'url(assets/fonts/SFThonburi.woff)'),

        // --- 8. กลุ่ม Sukhumvit Set (7 รายการ) ---
        new FontFace('SukhumvitSetBold', 'url(assets/fonts/SukhumvitSet-Bold.woff)'),
        new FontFace('SukhumvitSetExtraBold', 'url(assets/fonts/SukhumvitSet-Extra%20Bold.woff)'),
        new FontFace('SukhumvitSetLight', 'url(assets/fonts/SukhumvitSet-Light.woff)'),
        new FontFace('SukhumvitSetMedium', 'url(assets/fonts/SukhumvitSet-Medium.woff)'),
        new FontFace('SukhumvitSetSemiBold', 'url(assets/fonts/SukhumvitSet-SemiBold.woff)'),
        new FontFace('SukhumvitSetText', 'url(assets/fonts/SukhumvitSet-Text.woff)'),
        new FontFace('SukhumvitSetThin', 'url(assets/fonts/SukhumvitSet-Thin.woff)'),

        // --- 9. กลุ่ม TH Sarabun (8 รายการ) ---
        new FontFace('THSarabunBold', 'url(assets/fonts/THSarabun-Bold.woff)'),
        new FontFace('THSarabunBoldItalic', 'url(assets/fonts/THSarabun-BoldItalic.woff)'),
        new FontFace('THSarabunItalic', 'url(assets/fonts/THSarabun-Italic.woff)'),
        new FontFace('THSarabunRegular', 'url(assets/fonts/THSarabun.woff)'),
        new FontFace('THSarabunNewBold', 'url(assets/fonts/THSarabunNew-Bold.woff)'),
        new FontFace('THSarabunNewBoldItalic', 'url(assets/fonts/THSarabunNew-BoldItalic.woff)'),
        new FontFace('THSarabunNewItalic', 'url(assets/fonts/THSarabunNew-Italic.woff)'),
        new FontFace('THSarabunNew', 'url(assets/fonts/THSarabunNew.woff)'),

        // --- 10. กลุ่ม TTB Money (6 รายการ) ---
        new FontFace('TTBMoney', 'url(assets/fonts/TTB%20Money.woff)'),
        new FontFace('TTBMoneyBold', 'url(assets/fonts/TTB-Money-Bold.woff)'),
        new FontFace('TTBMoneyExtraBold', 'url(assets/fonts/TTB-Money-ExtraBold.woff)'),
        new FontFace('TTBMoneyMedium', 'url(assets/fonts/TTB-Money-Medium.woff)'),
        new FontFace('TTBMoneyRegular', 'url(assets/fonts/TTB-Money-Regular.woff)'),
        new FontFace('TTBMoneySemiBold', 'url(assets/fonts/TTB-Money-SemiBold.woff)'),

        // --- 🟢 เพิ่ม 10 ฟอนต์ใหม่ของคุณตรงนี้ให้ครบ 72 รายการ ---
        // เปลี่ยนชื่อไฟล์ .woff ในวงเล็บให้ตรงกับที่คุณมีในโฟลเดอร์ได้เลยครับ
        new FontFace('CustomFont63', 'url(assets/fonts/CustomFont63.woff)'),
        new FontFace('CustomFont64', 'url(assets/fonts/CustomFont64.woff)'),
        new FontFace('CustomFont65', 'url(assets/fonts/CustomFont65.woff)'),
        new FontFace('CustomFont66', 'url(assets/fonts/CustomFont66.woff)'),
        new FontFace('CustomFont67', 'url(assets/fonts/CustomFont67.woff)'),
        new FontFace('CustomFont68', 'url(assets/fonts/CustomFont68.woff)'),
        new FontFace('CustomFont69', 'url(assets/fonts/CustomFont69.woff)'),
        new FontFace('CustomFont70', 'url(assets/fonts/CustomFont70.woff)'),
        new FontFace('CustomFont71', 'url(assets/fonts/CustomFont71.woff)'),
        new FontFace('CustomFont72', 'url(assets/fonts/CustomFont72.woff)')
    ];

    // โหลดทั้งหมดรวดเดียว
    return Promise.all(fonts.map(font => 
        font.load().catch(e => console.warn(`⚠️ โหลดฟอนต์ ${font.family} ไม่สำเร็จ:`, e))
    )).then(function(loadedFonts) {
        loadedFonts.forEach(function(font) {
            if (font) document.fonts.add(font);
        });
        console.log(`✅ โหลดฟอนต์สำเร็จทั้งหมด ${loadedFonts.filter(f => f).length} รายการ`);
    });
}

// ------------------------------------------
// (ส่วนฟังก์ชันอื่นๆ เช่น formatDate, drawText, loadImage ยังเหมือนเดิมทุกประการครับ)
// ------------------------------------------

function padZero(number) { return number < 10 ? '0' + number : number; }

function formatDate(date) {
    if (!date || date === '-') return '-';
    const options = { day: 'numeric', month: 'short', year: '2-digit' };
    let formattedDate = new Date(date).toLocaleDateString('th-TH', options);
    formattedDate = formattedDate.replace(/ /g, ' ').replace(/\./g, '');
    const months = ['ม.ค.', 'ก.พ.', 'มี.ค.', 'เม.ย.', 'พ.ค.', 'มิ.ย.', 'ก.ค.', 'ส.ค.', 'ก.ย.', 'ต.ค.', 'พ.ย.', 'ธ.ค.'];
    const parts = formattedDate.split(' ');
    if (parts.length < 3) return formattedDate;
    const day = padZero(parts[0]);
    const month = months[new Date(date).getMonth()];
    let year = `25${parts[2]}`;
    return `${day} ${month} ${year}`;
}

function loadImage(src) {
    return new Promise((resolve) => {
        if (!src) { resolve(null); return; }
        const img = new Image();
        img.onload = () => resolve(img);
        img.onerror = () => resolve(null);
        img.src = src;
    });
}

function drawText(ctx, text, x, y, fontSize, fontFamily, color, align, lineHeight, maxLines, shadowColor, shadowBlur, maxWidth, letterSpacing) {
    ctx.font = `${fontSize}px ${fontFamily}`; 
    ctx.fillStyle = color; 
    ctx.textAlign = 'left';
    ctx.shadowColor = shadowColor || 'transparent';
    ctx.shadowBlur = shadowBlur || 0;

    const paragraphs = text.split('<br>'); 
    let currentY = y;

    paragraphs.forEach(paragraph => {
        const segmenter = new Intl.Segmenter('th', { granularity: 'word' });
        const words = [...segmenter.segment(paragraph)].map(segment => segment.segment);
        let lines = []; 
        let currentLine = '';

        words.forEach((word) => {
            const testLine = currentLine + word; 
            const metrics = ctx.measureText(testLine);
            const testWidth = metrics.width + (testLine.length - 1) * letterSpacing;

            if (testWidth > maxWidth && currentLine !== '') { 
                lines.push(currentLine); 
                currentLine = word; 
            } else { 
                currentLine = testLine; 
            }
        });
        if (currentLine) { lines.push(currentLine.trimStart()); }

        lines.forEach((line, index) => {
            let currentX = x;
            if (align === 'center') { 
                currentX = x - (ctx.measureText(line).width / 2) - ((line.length - 1) * letterSpacing) / 2; 
            } else if (align === 'right') { 
                currentX = x - ctx.measureText(line).width - ((line.length - 1) * letterSpacing); 
            }
            drawTextLine(ctx, line, currentX, currentY, letterSpacing); 
            currentY += lineHeight;
            if (maxLines && index >= maxLines - 1) return;
        });
    });
}

function drawTextLine(ctx, text, x, y, letterSpacing) {
    if (!letterSpacing) { 
        ctx.fillText(text, x, y); 
        return; 
    }
    const segmenter = new Intl.Segmenter('th', { granularity: 'grapheme' });
    const characters = [...segmenter.segment(text)].map(segment => segment.segment);
    let currentPosition = x;

    characters.forEach((char) => {
        ctx.fillText(char, currentPosition, y);
        currentPosition += ctx.measureText(char).width + letterSpacing;
    });
}

window.downloadImage = function(filename = 'slip.png') {
    const canvas = document.getElementById('canvas'); 
    if(!canvas) return;
    const link = document.createElement('a'); 
    link.href = canvas.toDataURL('image/png');
    link.download = filename; 
    link.click();
}