// js/banks/slip_make.js
(function() {
    const fontPath = 'assets/fonts';
    let fontsLoaded = false;

    async function loadFonts() {
        const fonts = [
            new FontFace('SukhumvitSetThin', `url(${fontPath}/SukhumvitSet-Thin.woff)`),
            new FontFace('SukhumvitSetText', `url(${fontPath}/SukhumvitSet-Text.woff)`),
            new FontFace('SukhumvitSetLight', `url(${fontPath}/SukhumvitSet-Light.woff)`),
            new FontFace('SukhumvitSetMedium', `url(${fontPath}/SukhumvitSet-Medium.woff)`),
            new FontFace('SukhumvitSetSemiBold', `url(${fontPath}/SukhumvitSet-SemiBold.woff)`),
            new FontFace('SukhumvitSetBold', `url(${fontPath}/SukhumvitSet-Bold.woff)`),
            new FontFace('SukhumvitSetExtraBold', `url(${fontPath}/SukhumvitSet-Extra%20Bold.woff)`),
            new FontFace('IBMPlexsansthaiThin', `url(${fontPath}/IBMPlexSansThai-Thin.woff)`),
            new FontFace('IBMPlexsansthaiExtraLight', `url(${fontPath}/IBMPlexSansThai-ExtraLight.woff)`),
            new FontFace('IBMPlexsansthaiLight', `url(${fontPath}/IBMPlexSansThai-Light.woff)`),
            new FontFace('IBMPlexsansthaiRegular', `url(${fontPath}/IBMPlexSansThai-Regular.woff)`),
            new FontFace('IBMPlexsansthaiMedium', `url(${fontPath}/IBMPlexSansThai-Medium.woff)`),
            new FontFace('IBMPlexsansthaiSemiBold', `url(${fontPath}/IBMPlexSansThai-SemiBold.woff)`),
            new FontFace('IBMPlexsansthaiBold', `url(${fontPath}/IBMPlexSansThai-Bold.woff)`)
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

    function padZero(num) {
        return num.toString().padStart(2, '0');
    }

    function formatDate(date) {
        if (!date || date === '-') return '-';
        const d = new Date(date);
        const day = String(d.getDate()).padStart(2, '0');
        const months = ['ม.ค.', 'ก.พ.', 'มี.ค.', 'เม.ย.', 'พ.ค.', 'มิ.ย.', 'ก.ค.', 'ส.ค.', 'ก.ย.', 'ต.ค.', 'พ.ย.', 'ธ.ค.'];
        const month = months[d.getMonth()];
        const year = (d.getFullYear() + 543).toString().slice(-2);
        return `${day} ${month} 25${year}`;
    }

    function generateUniqueID() {
        const datetimeInput = document.getElementById('datetime-input') || document.getElementById('datetime');
        const now = new Date(datetimeInput ? datetimeInput.value : new Date());
        const startDate = new Date("2024-07-24");
        const dayDifference = Math.floor((now - startDate) / (1000 * 60 * 60 * 24));
        const uniqueDay = (14206 + dayDifference).toString().padStart(6, '0');
        const timePart = `${padZero(now.getHours())}${padZero(now.getMinutes())}`;
        const randomPart = Math.floor(Math.random() * 100).toString().padStart(2, '0');
        const randomPart1 = Math.floor(Math.random() * 100000).toString().padStart(5, '0');
        return `${uniqueDay}${timePart}${randomPart}BOR${randomPart1}`;
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
    // ระบบจัดรูปแบบเลขบัญชีอัตโนมัติ MAKE
    // ==========================================
    window.autoFormatAccount = function() {
        const bank = document.getElementById('bank')?.value;
        const accInput = document.getElementById('receiveraccount');
        if (!bank || !accInput) return;

        let rawVal = accInput.value.replace(/[^0-9]/g, '');
        if (rawVal.length === 0) rawVal = "0000000000";

        if (bank.includes('วอลเล็ท') || bank.includes('เติมเงินพร้อมเพย์')) {
            rawVal = rawVal.padStart(15, '0');
            accInput.value = `${rawVal.substring(0,3)}-xxxxxxxx-${rawVal.slice(-4)}`;
        } else if (bank === 'ธ.ออมสิน' || bank === 'ธ.ก.ส.' || rawVal.length === 12) {
            rawVal = rawVal.padStart(12, '0');
            accInput.value = `xxx-x-x${rawVal.substring(5, 9)}-xxx`;
        } else if (bank === 'พร้อมเพย์' || bank === 'รหัสพร้อมเพย์') {
            rawVal = rawVal.padStart(10, '0');
            accInput.value = `xxx-xxx-${rawVal.slice(-4)}`;
        } else {
            rawVal = rawVal.padStart(10, '0');
            accInput.value = `xxx-x-x${rawVal.substring(5, 9)}-x`;
        }

        if (typeof window.triggerUpdate === 'function') window.triggerUpdate();
    };

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
            case 'ธ.กรุงไทย': bankLogoUrl = 'assets/image/logo/KTB4.png'; break;
            case 'ธ.กรุงเทพ': bankLogoUrl = 'assets/image/logo/BBL.png'; break;
            case 'ธ.ไทยพาณิชย์': bankLogoUrl = 'assets/image/logo/SCB.png'; break;
            case 'ธ.กรุงศรีอยุธยา': bankLogoUrl = 'assets/image/logo/BAY.png'; break;
            case 'ธ.ทหารไทยธนชาต': bankLogoUrl = 'assets/image/logo/TTB1.png'; break;
            case 'ธ.ออมสิน': bankLogoUrl = 'assets/image/logo/O.png'; break;
            case 'ธ.ก.ส.': bankLogoUrl = 'assets/image/logo/T.png'; break;
            case 'ธ.อาคารสงเคราะห์': bankLogoUrl = 'assets/image/logo/C.png'; break;
            case 'ธ.เกียรตินาคินภัทร': bankLogoUrl = 'assets/image/logo/K.png'; break;
            case 'ธ.ซีไอเอ็มบีไทย': bankLogoUrl = 'assets/image/logo/CIMB.png'; break;
            case 'ธ.ยูโอบี': bankLogoUrl = 'assets/image/logo/UOB.png'; break;
            case 'ธ.แลนด์ แอนด์ เฮ้าส์': bankLogoUrl = 'assets/image/logo/LHBANK.png'; break;
            case 'ธ.ไอซีบีซี': bankLogoUrl = 'assets/image/logo/ICBC.png'; break;
            case 'พร้อมเพย์': bankLogoUrl = 'assets/image/logo/P-Make.png'; break;
            case 'พร้อมเพย์วอลเล็ท': bankLogoUrl = 'assets/image/logo/P-Make.png'; break;
            default: bankLogoUrl = 'assets/image/logo/P-Make.png'; break;
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
        
        let backgroundImageSrc = document.getElementById('backgroundSelect')?.value || 'assets/image/bs/MAKE1.jpg';
        if (isNoteMode) {
            backgroundImageSrc = backgroundImageSrc.replace('.jpg', 'T.jpg');
        }

        const [bgImg, bankLogoImg, kbankLogoImg, customStickerImg] = await Promise.all([
            loadImage(backgroundImageSrc),
            loadImage(bankLogoUrl),
            loadImage('assets/image/logo/KBANK.png'), 
            loadImage((selectedImage && !selectedImage.includes('NO.png')) ? selectedImage : null)
        ]);

        if (bgImg) {
            canvas.width = bgImg.width;
            canvas.height = bgImg.height;
            ctx.clearRect(0, 0, canvas.width, canvas.height);
            ctx.drawImage(bgImg, 0, 0, canvas.width, canvas.height);
        } else {
            canvas.width = 1074;
            canvas.height = isNoteMode ? 1239 : 1095;
            ctx.fillStyle = '#ffffff'; ctx.fillRect(0, 0, canvas.width, canvas.height);
            ctx.fillStyle = '#ff4d4f'; ctx.font = '30px IBMPlexsansthaiBold';
            ctx.fillText('❌ หาไฟล์พื้นหลังไม่เจอ!', 50, canvas.height / 2);
        }

        if (bankLogoImg) ctx.drawImage(bankLogoImg, 37, 493, 118, 118);
        if (kbankLogoImg) ctx.drawImage(kbankLogoImg, 37, 289, 118, 118);

        drawText(ctx, `${formattedDate}  ${formattedTime}`, 50, 161.1, 36, 'IBMPlexsansthaiRegular', '#75859f', 'left', 1.5, 3, 0, 0, 500, 0);

        drawText(ctx, `${sendername}`, 170, 341.6, 41, 'IBMPlexsansthaiSemiBold', '#353e4f', 'left', 1.5, 3, 0, 0, 500, 0);
        drawText(ctx, `${senderaccount}`, 170, 389.9, 36, 'IBMPlexsansthaiRegular', '#75859f', 'left', 1.5, 1, 0, 0, 500, 0);
        
        drawText(ctx, `${receivername}`, 170, 546, 41, 'IBMPlexsansthaiSemiBold', '#353e4f', 'left', 1.5, 3, 0, 0, 500, 0);
        drawText(ctx, `${receiveraccount}`, 170, 594.1, 36, 'IBMPlexsansthaiRegular', '#75859f', 'left', 1.5, 1, 0, 0, 500, 0);
        
        drawText(ctx, `${amount11}`, 46, 810, 60, 'IBMPlexsansthaiSemiBold', '#353e4f', 'left', 1.5, 3, 0, 0, 500, 0);
        drawText(ctx, `บาท`, 46 + ctx.measureText(`${amount11}`).width + 15, 811, 38, 'IBMPlexsansthaiMedium', '#353e4f', 'left', 1.5, 3, 0, 0, 500, 0);
        drawText(ctx, `0.00 บาท`, 46, 957.3, 38.44, 'IBMPlexsansthaiMedium', '#353e4f', 'left', 1.5, 3, 0, 0, 500, 0);

        drawText(ctx, `${generateUniqueID()}`, 259, 1035.5, 35.63, 'IBMPlexsansthaiRegular', '#789099', 'left', 1.5, 3, 0, 0, 500, 0);
        
        if (QRCode) {
            drawText(ctx, `${QRCode}`, 238.9, 599.0, 33, 'IBMPlexsansthaiRegular', '#4e4e4e', 'left', 1.5, 5, 0, 0, 500, 0);
        }

        if (isNoteMode) {
            drawText(ctx, `${AideMemoire}`, 74, 1155, 37, 'IBMPlexsansthaiMedium', '#353e4f', 'left', 1.5, 3, 0, 0, 500, 0);
        }

        if (customStickerImg) {
            ctx.drawImage(customStickerImg, 0, 0, canvas.width, canvas.height); 
        }
    }

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
        link.download = 'slip_make.png';
        link.click();
    };

})();