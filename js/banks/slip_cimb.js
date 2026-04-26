// js/banks/slip_cimb.js
// รวมระบบสร้างสลิป CIMB ไทย ทั้งโหมดปกติ และ โหมดบันทึกช่วยจำ (Note)

(function() {
    const fontPath = 'assets/fonts';
    let fontsLoaded = false;

    // ==========================================
    // 1. ระบบโหลดฟอนต์ทั้งหมด
    // ==========================================
    async function loadFonts() {
        const fonts = [
            new FontFace('SukhumvitSetLight', `url(${fontPath}/SukhumvitSet-Light.woff)`),
            new FontFace('SukhumvitSetMedium', `url(${fontPath}/SukhumvitSet-Medium.woff)`),
            new FontFace('SukhumvitSetSemiBold', `url(${fontPath}/SukhumvitSet-SemiBold.woff)`)
        ];

        return Promise.all(fonts.map(font => font.load().catch(e => console.warn(e)))).then(function(loadedFonts) {
            loadedFonts.forEach(function(font) {
                if (font) document.fonts.add(font);
            });
        });
    }

    function ensureFontsLoaded() {
        if (fontsLoaded) return Promise.resolve();
        return loadFonts().then(() => { fontsLoaded = true; });
    }

    // ==========================================
    // 2. ฟังก์ชันเครื่องมือ (Helpers)
    // ==========================================
    function padZero(number) {
        return number.toString().padStart(2, '0');
    }

    function formatDate(date) {
        if (!date || date === '-') return '-';
        const options = { day: 'numeric', month: 'short', year: '2-digit' };
        let formattedDate = new Date(date).toLocaleDateString('th-TH', options);
        formattedDate = formattedDate.replace(/ /g, ' ').replace(/\./g, '');
        const months = ['ม.ค.', 'ก.พ.', 'มี.ค.', 'เม.ย.', 'พ.ค.', 'มิ.ย.', 'ก.ค.', 'ส.ค.', 'ก.ย.', 'ต.ค.', 'พ.ย.', 'ธ.ค.'];
        const day = padZero(formattedDate.split(' ')[0]);
        const month = months[new Date(date).getMonth()];
        const yearCE = new Date(date).getFullYear();
        const yearBE = (yearCE + 543).toString().substring(2); 
        return `${day} ${month} ${yearBE}`;
    }

    function generateUniqueID() {
        const now = new Date(document.getElementById('datetime-input')?.value || new Date());
        const year = (now.getFullYear() % 100).toString().padStart(2, '0');
        const month = (now.getMonth() + 1).toString().padStart(2, '0');
        const day = now.getDate().toString().padStart(2, '0');
        const time = `${padZero(now.getHours())}${padZero(now.getMinutes())}`;
        const randomPart = Math.floor(Math.random() * 10000000000).toString().padStart(10, '0');
        return `${year}${month}${day}${time}${randomPart}`;
    }

    function getInputValue(id, fallback = '') {
        const el = document.getElementById(id);
        return el && el.value ? el.value : fallback;
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

    // ==========================================
    // ฟังก์ชันช่วยวาดข้อความ (Text) จัดการสระลอย
    // ==========================================
    function drawText(ctx, text, x, y, fontSize, fontFamily, color, align, lineHeight, maxLines, shadowColor, shadowBlur, maxWidth, letterSpacing) {
        if (!text || text === '-') return;
        ctx.font = `${fontSize}px ${fontFamily}`;
        ctx.fillStyle = color;
        ctx.textAlign = 'left';
        ctx.shadowColor = shadowColor || 'transparent';
        ctx.shadowBlur = shadowBlur || 0;

        const paragraphs = text.split('<br>');
        let currentY = y;

        paragraphs.forEach(paragraph => {
            const lines = [];
            let currentLine = '';

            for (let i = 0; i < paragraph.length; i++) {
                const char = paragraph[i];
                const isThai = /[\u0E00-\u0E7F]/.test(char);
                const isWhitespace = /\s/.test(char);

                if (isThai && !isWhitespace) {
                    const testLine = currentLine + char;
                    const metrics = ctx.measureText(testLine);
                    const testWidth = metrics.width + (testLine.length - 1) * letterSpacing;

                    if (maxWidth && testWidth > maxWidth) {
                        lines.push(currentLine.trim());
                        currentLine = char;
                    } else {
                        currentLine = testLine;
                    }
                } else {
                    const testLine = currentLine + char;
                    const metrics = ctx.measureText(testLine);
                    const testWidth = metrics.width + (testLine.length - 1) * letterSpacing;

                    if (maxWidth && testWidth > maxWidth) {
                        lines.push(currentLine.trim());
                        currentLine = char;
                    } else {
                        currentLine = testLine;
                    }
                }
            }

            lines.push(currentLine.trim());

            lines.forEach((line, index) => {
                let currentX = x;
                if (align === 'center') {
                    currentX = x - (ctx.measureText(line).width / 2) - ((line.length - 1) * letterSpacing) / 2;
                } else if (align === 'right') {
                    currentX = x - ctx.measureText(line).width - ((line.length - 1) * letterSpacing);
                }

                drawTextLine(ctx, line, currentX, currentY, letterSpacing);
                currentY += lineHeight > 10 ? lineHeight : fontSize * lineHeight;
                if (maxLines && index >= maxLines - 1) return;
            });
        });
    }

    function drawTextLine(ctx, text, x, y, letterSpacing) {
        if (!letterSpacing) {
            ctx.fillText(text, x, y);
            return;
        }

        try {
            const segmenter = new Intl.Segmenter('th', { granularity: 'grapheme' });
            const characters = [...segmenter.segment(text)].map(seg => seg.segment);
            let currentPosition = x;

            characters.forEach((char, index) => {
                const charCode = char.charCodeAt(0);
                const prevChar = index > 0 ? characters[index - 1] : null;

                const isUpperVowel = (charCode >= 0x0E34 && charCode <= 0x0E37);
                const isToneMark = (charCode >= 0x0E48 && charCode <= 0x0E4C);
                const isBeforeVowel = (charCode === 0x0E31);
                const isBelowVowel = (charCode >= 0x0E38 && charCode <= 0x0E3A);

                let yOffset = 0;
                let xOffset = 0;

                if (isUpperVowel) { yOffset = -1; xOffset = 0; }
                if (isToneMark) {
                    if (prevChar && ((prevChar.charCodeAt(0) >= 0x0E34 && prevChar.charCodeAt(0) <= 0x0E37) || prevChar.charCodeAt(0) === 0x0E31)) {
                        yOffset = -8; xOffset = 0;
                    } else {
                        yOffset = 0; xOffset = -7;
                    }
                }
                if (isBeforeVowel) { yOffset = -1; xOffset = 1; }
                if (isBelowVowel) { yOffset = 0; xOffset = -10; }

                ctx.fillText(char, currentPosition + xOffset, y + yOffset);

                if (!isToneMark && !isBeforeVowel && !isBelowVowel) {
                    currentPosition += ctx.measureText(char).width + letterSpacing;
                } else {
                    currentPosition += ctx.measureText(char).width;
                }
            });
        } catch(e) {
            ctx.fillText(text, x, y);
        }
    }

    // ==========================================
    // 3. ฟังก์ชันหลักสำหรับวาด Canvas
    // ==========================================
    async function renderSlipDisplay() {
        const sendername = getInputValue('sendername', '-');
        const senderaccount = getInputValue('senderaccount', '-');
        const receivername = getInputValue('receivername', '-');
        const receiveraccount = getInputValue('receiveraccount', '-');
        const bank = getInputValue('bank', '-');
        const amount11 = getInputValue('amount11', '0.00');
        
        const datetimeVal = document.getElementById('datetime-input')?.value || document.getElementById('datetime')?.value || '-';
        const datetime = datetimeVal;

        const AideMemoire = getInputValue('AideMemoire', '-');
        const selectedImage = getInputValue('imageSelect', '');
        const QRCode = getInputValue('QRCode', '');

        const noteToggleElem = document.getElementById('modeSwitch');
        const isNoteMode = noteToggleElem ? noteToggleElem.checked : false;

        let bankLogoUrl = '';
        switch (bank) {
            case 'ธ.กสิกรไทย': bankLogoUrl = 'assets/image/logo/KBANK.png'; break;
            case 'ธ.กรุงไทย': bankLogoUrl = 'assets/image/logo/KTB.png'; break;
            case 'ธ.กรุงเทพ': bankLogoUrl = 'assets/image/logo/BBL1.png'; break;
            case 'ธ.ไทยพาณิชย์': bankLogoUrl = 'assets/image/logo/SCB1.png'; break;
            case 'ธ.กรุงศรีอยุธยา': bankLogoUrl = 'assets/image/logo/BAY.png'; break;
            case 'ธ.ทหารไทยธนชาต': bankLogoUrl = 'assets/image/logo/TTB1.png'; break;
            case 'ธ.ออมสิน': bankLogoUrl = 'assets/image/logo/O.png'; break;
            case 'ธ.ก.ส.': bankLogoUrl = 'assets/image/logo/T.png'; break;
            case 'ธ.อาคารสงเคราะห์': bankLogoUrl = 'assets/image/logo/C.png'; break;
            case 'ธ.เกียรตินาคินภัทร': bankLogoUrl = 'assets/image/logo/K.png'; break;
            case 'ธ.ซีไอเอ็มบีไทย': bankLogoUrl = 'assets/image/logo/C-CIMB.png'; break;
            case 'ธ.ยูโอบี': bankLogoUrl = 'assets/image/logo/UOB.png'; break;
            case 'ธ.แลนด์ แอนด์ เฮาส์': bankLogoUrl = 'assets/image/logo/LHBANK.png'; break;
            case 'ธ.ไอซีบีซี': bankLogoUrl = 'assets/image/logo/ICBC.png'; break;
            case 'พร้อมเพย์': bankLogoUrl = 'assets/image/logo/P-Krungsri.png'; break;
            case 'พร้อมเพย์วอลเล็ท': bankLogoUrl = 'assets/image/logo/P-Krungsri1.png'; break;
            case 'MetaAds': bankLogoUrl = 'assets/image/logo/Meta3.png'; break;
            default: bankLogoUrl = '';
        }

        const formattedDate = formatDate(datetime);
        let formattedTime = '';
        if (datetime && datetime !== '-') {
            const d = new Date(datetime);
            if (!isNaN(d.getTime())) formattedTime = d.toLocaleTimeString('th-TH', { hour: '2-digit', minute: '2-digit' });
        }

        const canvas = document.getElementById('canvas');
        if (!canvas) return;
        const ctx = canvas.getContext('2d');
        
        let backgroundImageSrc = isNoteMode ? 'assets/image/bs/C1T.jpg' : 'assets/image/bs/C1.jpg';
        canvas.width = isNoteMode ? 899 : 922;
        canvas.height = 1280;

        const [bgImg, bankLogoImg, customStickerImg, cimbLogoImg] = await Promise.all([
            loadImage(backgroundImageSrc),
            loadImage(bankLogoUrl),
            loadImage((selectedImage && !selectedImage.includes('NO.png')) ? selectedImage : null),
            loadImage('assets/image/logo/C-CIMB.png')
        ]);

        if (bgImg) {
            ctx.clearRect(0, 0, canvas.width, canvas.height);
            ctx.drawImage(bgImg, 0, 0, canvas.width, canvas.height);
        } else {
            ctx.fillStyle = '#1e293b'; ctx.fillRect(0, 0, canvas.width, canvas.height);
            ctx.fillStyle = '#ff4d4f'; ctx.font = '20px SukhumvitSetSemiBold';
            ctx.fillText('❌ หาไฟล์พื้นหลังไม่เจอ!', 50, canvas.height / 2);
        }

        if (isNoteMode) {
            // โหมดบันทึกช่วยจำ
            if(bankLogoImg) ctx.drawImage(bankLogoImg, 32, 621, 118, 118); 
            if(cimbLogoImg) ctx.drawImage(cimbLogoImg, 32, 401, 118, 118);
            
            drawText(ctx, `${formattedDate} - ${formattedTime} น.`, 41.7, 336.5, 36, 'SukhumvitSetLight', '#a0a0a0', 'left', 1.5, 3, 0, 0, 800, 0);

            drawText(ctx, `${sendername}`, 182, 450.0, 40, 'SukhumvitSetMedium', '#0f0f0f', 'left', 1.5, 3, 0, 0, 800, 0.25);
            drawText(ctx, `${senderaccount}`, 182, 505.3, 35, 'SukhumvitSetMedium', '#585858', 'left', 1.5, 1, 0, 0, 500, 0.25);
            
            drawText(ctx, `${receivername}`, 182, 670.3, 40, 'SukhumvitSetMedium', '#0f0f0f', 'left', 1.5, 3, 0, 0, 800, 0);
            drawText(ctx, `${receiveraccount}`, 182, 725.5, 35, 'SukhumvitSetMedium', '#585858', 'left', 1.5, 1, 0, 0, 500, 0.25);
            
            drawText(ctx, `฿ ${amount11}`, 860, 867.3, 46, 'SukhumvitSetSemiBold', '#000000', 'right', 1.5, 3, 0, 0, 500, 0);

            drawText(ctx, `${generateUniqueID()}`, 41.7, 1035.3, 30, 'SukhumvitSetMedium', '#6a6a6a', 'left', 1.5, 3, 0, 0, 500, 0);
            drawText(ctx, `฿ 0.00`, 41.7, 1130.5, 30, 'SukhumvitSetMedium', '#6a6a6a', 'left', 1.5, 3, 0, 0, 500, 0);
            drawText(ctx, `${AideMemoire}`, 41.7, 1226.4, 30, 'SukhumvitSetMedium', '#6a6a6a', 'left', 1.5, 3, 0, 0, 500, 0);
        } else {
            // โหมดปกติ
            if(bankLogoImg) ctx.drawImage(bankLogoImg, 32.5, 638, 120, 120); 
            if(cimbLogoImg) ctx.drawImage(cimbLogoImg, 32.5, 412.5, 120, 120);
            
            drawText(ctx, `${formattedDate} - ${formattedTime} น.`, 41.7, 345, 36, 'SukhumvitSetLight', '#a0a0a0', 'left', 1.5, 3, 0, 0, 800, 0);

            drawText(ctx, `${sendername}`, 186.3, 461.0, 40, 'SukhumvitSetMedium', '#0f0f0f', 'left', 1.5, 3, 0, 0, 800, 0.25);
            drawText(ctx, `${senderaccount}`, 186.3, 518.2, 35, 'SukhumvitSetMedium', '#585858', 'left', 1.5, 1, 0, 0, 500, 0.25);
            
            drawText(ctx, `${receivername}`, 186.3, 687.5, 40, 'SukhumvitSetMedium', '#0f0f0f', 'left', 1.5, 3, 0, 0, 800, 0);
            drawText(ctx, `${receiveraccount}`, 186.3, 744.6, 35, 'SukhumvitSetMedium', '#585858', 'left', 1.5, 1, 0, 0, 500, 0.25);
            
            drawText(ctx, `฿ ${amount11}`, 881, 890, 46, 'SukhumvitSetSemiBold', '#000000', 'right', 1.5, 3, 0, 0, 500, 0);

            drawText(ctx, `${generateUniqueID()}`, 41.7, 1064.4, 31, 'SukhumvitSetMedium', '#6a6a6a', 'left', 1.5, 3, 0, 0, 500, 0);
            drawText(ctx, `฿ 0.00`, 41.7, 1161.5, 31, 'SukhumvitSetMedium', '#6a6a6a', 'left', 1.5, 3, 0, 0, 500, 0);
        }

        drawText(ctx, `${QRCode}`, 238.9, 599.0, 40, 'SukhumvitSetMedium', '#4e4e4e', 'left', 1.5, 5, 0, 0, 500, 0);

        if (customStickerImg) {
            ctx.drawImage(customStickerImg, 0, 0, canvas.width, canvas.height); 
        }
    }

    // ==========================================
    // 4. ส่งออกฟังก์ชัน (Export)
    // ==========================================
    window.updateDisplayStandard = function() {
        ensureFontsLoaded().then(() => { renderSlipDisplay(); }).catch(() => { renderSlipDisplay(); });
    };

    window.updateDisplayNote = function() {
        ensureFontsLoaded().then(() => { renderSlipDisplay(); }).catch(() => { renderSlipDisplay(); });
    };

    window.downloadImage = function() {
        const canvas = document.getElementById('canvas');
        if(!canvas) return;
        const link = document.createElement('a');
        link.href = canvas.toDataURL('image/png');
        link.download = 'slip_cimb.png';
        link.click();
    };

})();