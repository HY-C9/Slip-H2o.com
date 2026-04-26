// js/banks/slip_linebk.js
(function() {
    const fontPath = 'assets/fonts';
    let fontsLoaded = false;

    async function loadFonts() {
        const fonts = [
            new FontFace('SFThonburiLight', `url(${fontPath}/SFThonburi.woff)`),
            new FontFace('SFThonburiRegular', `url(${fontPath}/SFThonburi-Regular.woff)`),
            new FontFace('SFThonburiSemiBold', `url(${fontPath}/SFThonburi-Semibold.woff)`),
            new FontFace('SFThonburiBold', `url(${fontPath}/SFThonburi-Bold.woff)`)
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

    function formatDate(date) {
        if (!date || date === '-') return '-';
        const d = new Date(date);
        const day = String(d.getDate()).padStart(2, '0');
        const months = ['ม.ค.', 'ก.พ.', 'มี.ค.', 'เม.ย.', 'พ.ค.', 'มิ.ย.', 'ก.ค.', 'ส.ค.', 'ก.ย.', 'ต.ค.', 'พ.ย.', 'ธ.ค.'];
        const month = months[d.getMonth()];
        const year = (d.getFullYear() + 543).toString().slice(-2);
        return `${day} ${month} ${year}`;
    }

    function generateRandomString(length, numDigits) {
        const letters = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ';
        const digits = '123456789';
        let result = [];

        for (let i = 0; i < numDigits; i++) {
            result.push(digits.charAt(Math.floor(Math.random() * digits.length)));
        }
        for (let i = 0; i < length - numDigits; i++) {
            result.push(letters.charAt(Math.floor(Math.random() * letters.length)));
        }
        for (let i = result.length - 1; i > 0; i--) {
            const j = Math.floor(Math.random() * (i + 1));
            [result[i], result[j]] = [result[j], result[i]];
        }
        return result.join('');
    }

    function generateUniqueID() {
        const datetimeInput = document.getElementById('datetime-input') || document.getElementById('datetime');
        const now = new Date(datetimeInput ? datetimeInput.value : new Date());
        const startDate = new Date("2024-07-24");
        const dayDifference = Math.floor((now - startDate) / (1000 * 60 * 60 * 24));
        const uniqueDayNumber = 54206 + dayDifference;
        const uniqueDayString = uniqueDayNumber.toString().padStart(6, '0');

        const randomString = generateRandomString(13, 3); 
        return uniqueDayString + randomString;
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
    // ระบบจัดรูปแบบเลขบัญชีอัตโนมัติ LINE BK
    // ==========================================
    window.autoFormatAccount = function() {
        const bank = document.getElementById('bank')?.value;
        const accInput = document.getElementById('receiveraccount');
        if (!bank || !accInput) return;

        let rawVal = accInput.value.replace(/[^0-9]/g, '');
        if (rawVal.length === 0) return;

        if (bank.includes('วอลเล็ท') || bank.includes('เติมเงินพร้อมเพย์') || rawVal.length >= 15) {
            rawVal = rawVal.padStart(15, '0');
            accInput.value = `XXXXXXXXXXX${rawVal.slice(-4)}`;
        } else if (bank === 'ออมสิน' || bank === 'ธ.ก.ส.' || rawVal.length === 12) {
            rawVal = rawVal.padStart(12, '0');
            accInput.value = `XXXXXXXX${rawVal.slice(-4)}`;
        } else {
            rawVal = rawVal.padStart(10, '0');
            accInput.value = `XXXXXX${rawVal.slice(-4)}`;
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
            case 'กสิกรไทย': bankLogoUrl = 'assets/image/logo/KBANK.png'; break;
            case 'กรุงไทย': bankLogoUrl = 'assets/image/logo/KTB.png'; break;
            case 'กรุงเทพ': bankLogoUrl = 'assets/image/logo/BBL.png'; break;
            case 'ไทยพาณิชย์': bankLogoUrl = 'assets/image/logo/SCB.png'; break;
            case 'กรุงศรีอยุธยา': bankLogoUrl = 'assets/image/logo/BAY.png'; break;
            case 'ทหารไทยธนชาต': bankLogoUrl = 'assets/image/logo/TTB1.png'; break;
            case 'ออมสิน': bankLogoUrl = 'assets/image/logo/O.png'; break;
            case 'ธ.ก.ส.': bankLogoUrl = 'assets/image/logo/T.png'; break;
            case 'อาคารสงเคราะห์': bankLogoUrl = 'assets/image/logo/C.png'; break;
            case 'เกียรตินาคินภัทร': bankLogoUrl = 'assets/image/logo/K.png'; break;
            case 'ซีไอเอ็มบีไทย': bankLogoUrl = 'assets/image/logo/CIMB.png'; break;
            case 'ยูโอบี': bankLogoUrl = 'assets/image/logo/UOB.png'; break;
            case 'แลนด์ แอนด์ เฮ้าส์': bankLogoUrl = 'assets/image/logo/LHBANK.png'; break;
            case 'ไอซีบีซี': bankLogoUrl = 'assets/image/logo/ICBC.png'; break;
            case 'รหัส e-Wallet': bankLogoUrl = 'assets/image/logo/P-LINE BK.png'; break;
            case 'พร้อมเพย์วอลเล็ท': bankLogoUrl = 'assets/image/logo/P-LINE BK.png'; break;
            default: bankLogoUrl = 'assets/image/logo/P-LINE BK.png'; break;
        }

        const formattedDate = formatDate(datetime);
        let formattedTime = '';
        if (datetime && datetime !== '-') {
            const d = new Date(datetime);
            if (!isNaN(d.getTime())) formattedTime = d.toLocaleTimeString('th-TH', { hour: '2-digit', minute: '2-digit', second: '2-digit' });
        }

        const canvas = document.getElementById('canvas');
        if (!canvas) return;
        const ctx = canvas.getContext('2d');

        let backgroundImageSrc = isNoteMode ? 'assets/image/bs/LINEBK1T.jpg' : 'assets/image/bs/LINEBK1.jpg';

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
            canvas.width = isNoteMode ? 990 : 1080;
            canvas.height = 1280;
            ctx.fillStyle = '#ffffff'; ctx.fillRect(0, 0, canvas.width, canvas.height);
            ctx.fillStyle = '#ff4d4f'; ctx.font = '30px SFThonburiBold';
            ctx.fillText('❌ หาไฟล์พื้นหลังไม่เจอ!', 50, canvas.height / 2);
        }

        if (isNoteMode) {
            drawText(ctx, `฿${amount11}`, 73, 306, 108, 'SFThonburiBold', '#000000', 'left', 1.5, 3, 0, 0, 880, 0);
            drawText(ctx, `${formattedDate} ${formattedTime}`, 73, 382.9, 39, 'SFThonburiRegular', '#999999', 'left', 1.5, 3, 0, 0, 880, 0);

            drawText(ctx, `${sendername}`, 805, 503.1, 39, 'SFThonburiRegular', '#000000', 'right', 1.5, 3, 0, 0, 880, 0);
            drawText(ctx, `กสิกรไทย ${senderaccount}`, 805, 554, 34, 'SFThonburiRegular', '#999999', 'right', 1.5, 2, 0, 0, 880, 0);
            if(kbankLogoImg) ctx.drawImage(kbankLogoImg, 822, 464.5, 95, 95); 

            drawText(ctx, `${receivername}`, 805, 632.4, 39, 'SFThonburiRegular', '#000000', 'right', 1.5, 3, 0, 0, 880, 0);
            drawText(ctx, `${bank} ${receiveraccount}`, 805, 682.2, 34, 'SFThonburiRegular', '#999999', 'right', 1.5, 2, 0, 0, 880, 0);
            if(bankLogoImg) ctx.drawImage(bankLogoImg, 822, 593, 95, 95); 

            drawText(ctx, `฿0.00`, 911.3, 760, 41, 'SFThonburiRegular', '#000000', 'right', 1.5, 3, 0, 0, 880, 0);
            drawText(ctx, `${generateUniqueID()}`, 911.3, 842, 41, 'SFThonburiRegular', '#000000', 'right', 1.5, 3, 0, 0, 880, 0);
            drawText(ctx, `${AideMemoire}`, 911.3, 930.7, 41, 'SFThonburiRegular', '#000000', 'right', 1.5, 3, 0, 0, 880, 0);

            if (QRCode) {
                drawText(ctx, `${QRCode}`, 238.9, 599.0, 33, 'SFThonburiRegular', '#4e4e4e', 'left', 1.5, 5, 0, 0, 880, 0);
            }
        } else {
            drawText(ctx, `฿${amount11}`, 79, 329, 115, 'SFThonburiBold', '#000000', 'left', 1.5, 3, 0, 0, 950, 0);
            drawText(ctx, `${formattedDate} ${formattedTime}`, 79, 409.9, 42, 'SFThonburiRegular', '#999999', 'left', 1.5, 3, 0, 0, 880, 0);

            drawText(ctx, `${sendername}`, 863, 539.4, 42, 'SFThonburiRegular', '#000000', 'right', 1.5, 3, 0, 0, 880, 0);
            drawText(ctx, `กสิกรไทย ${senderaccount}`, 863, 592.9, 37, 'SFThonburiRegular', '#999999', 'right', 1.5, 2, 0, 0, 880, 0);
            if(kbankLogoImg) ctx.drawImage(kbankLogoImg, 882, 498, 101, 101); 

            drawText(ctx, `${receivername}`, 863, 677.6, 42, 'SFThonburiRegular', '#000000', 'right', 1.5, 3, 0, 0, 880, 0);
            drawText(ctx, `${bank} ${receiveraccount}`, 863, 731.6, 37, 'SFThonburiRegular', '#999999', 'right', 1.5, 2, 0, 0, 880, 0);
            if(bankLogoImg) ctx.drawImage(bankLogoImg, 882, 636, 101, 101); 

            drawText(ctx, `฿0.00`, 974.6, 815.7, 43, 'SFThonburiRegular', '#000000', 'right', 1.5, 3, 0, 0, 880, 0);
            drawText(ctx, `${generateUniqueID()}`, 974.6, 902.6, 43, 'SFThonburiRegular', '#000000', 'right', 1.5, 3, 0, 0, 880, 0);

            if (QRCode) {
                drawText(ctx, `${QRCode}`, 238.9, 599.0, 33, 'SFThonburiRegular', '#4e4e4e', 'left', 1.5, 5, 0, 0, 880, 0);
            }
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
        link.download = 'slip_linebk.png';
        link.click();
    };

})();