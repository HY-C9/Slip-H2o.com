// js/banks/slip_bay.js
// รวมระบบสร้างสลิปกรุงศรี (BAY) ทั้งโหมดปกติ และ โหมดบันทึกช่วยจำ (Note)

(function() {
    const fontPath = 'assets/fonts';
    let fontsLoaded = false;

    // ==========================================
    // 1. ระบบโหลดฟอนต์ทั้งหมด
    // ==========================================
    async function loadFonts() {
        const fonts = [
            new FontFace('krungsriRegular', `url(${fontPath}/krungsri_con-webfont.woff)`),
            new FontFace('krungsriMedium', `url(${fontPath}/krungsri_con_med-webfont.woff)`),
            new FontFace('krungsriBold', `url(${fontPath}/krungsri_con_bol-webfont.woff)`)
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
        return number < 10 ? '0' + number : number;
    }

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
        let year = parts[2];
        year = `25${year}`;
        return `${day} ${month} ${year}`;
    }

    function generateUniqueID() {
        const now = new Date(document.getElementById('datetime-input')?.value || new Date());
        const startDate = new Date("2024-07-29");
        const dayDifference = Math.floor((now - startDate) / (1000 * 60 * 60 * 24));
        const uniqueDayIncrement = Math.floor(dayDifference / 3);
        const uniqueDay = (334 + uniqueDayIncrement).toString().padStart(3, '0');
        const timePart = `${padZero(now.getHours())}${padZero(now.getMinutes())}`;
        const randomPart = Math.floor(Math.random() * 100).toString().padStart(2, '0');
        const randomPart1 = Math.floor(Math.random() * 10000000).toString().padStart(8, '0');
        return `KSA000000000${randomPart1}`;
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

    function drawTextLine(ctx, text, x, y, letterSpacing) {
        if (!letterSpacing) {
            ctx.fillText(text, x, y);
            return;
        }

        const characters = text.split('');
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
    }

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
                const testLine = currentLine + char;
                const metrics = ctx.measureText(testLine);
                const testWidth = metrics.width + (testLine.length - 1) * letterSpacing;

                if (testWidth > maxWidth) {
                    lines.push(currentLine.trim());
                    currentLine = char;
                } else {
                    currentLine = testLine;
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
                currentY += lineHeight;
                if (maxLines && index >= maxLines - 1) return;
            });
        });
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
        const amount11 = getInputValue('amount11', '-');
        const datetime = getInputValue('datetime-input', '-'); // อิงจาก HTML ที่เปลี่ยน ID
        const QRCode = getInputValue('QRCode', '');
        const AideMemoire = getInputValue('AideMemoire', '-');
        
        const selectedImage = getInputValue('imageSelect', '');
        let backgroundSelect = getInputValue('backgroundSelect', '');

        const noteToggleElem = document.getElementById('modeSwitch');
        const isNoteMode = noteToggleElem ? noteToggleElem.checked : false;

        let bankLogoUrl = '';
        switch (bank) {
            case 'KBANK': bankLogoUrl = 'assets/image/logo/KBANK1.png'; break;
            case 'KTB': bankLogoUrl = 'assets/image/logo/KTB2.png'; break;
            case 'BBL': bankLogoUrl = 'assets/image/logo/BBL1.png'; break;
            case 'SCB': bankLogoUrl = 'assets/image/logo/SCB.png'; break;
            case 'BAY': bankLogoUrl = 'assets/image/logo/BAY2.png'; break;
            case 'ttb': bankLogoUrl = 'assets/image/logo/TTB3.png'; break;
            case 'GSB': bankLogoUrl = 'assets/image/logo/O.png'; break;
            case 'BAAC': bankLogoUrl = 'assets/image/logo/T.png'; break;
            case 'GHB': bankLogoUrl = 'assets/image/logo/C.png'; break;
            case 'KKP': bankLogoUrl = 'assets/image/logo/K.png'; break;
            case 'CIMB': bankLogoUrl = 'assets/image/logo/CIMB.png'; break;
            case 'UOB': bankLogoUrl = 'assets/image/logo/UOB1.png'; break;
            case 'LH BANK': bankLogoUrl = 'assets/image/logo/LHBANK1.png'; break;
            case 'ICBC': bankLogoUrl = 'assets/image/logo/ICBC.png'; break;
            case 'PromptPay': bankLogoUrl = 'assets/image/logo/P-Krungsri.png'; break;
            case 'PromptPay TrueMoney': bankLogoUrl = 'assets/image/logo/P-Krungsri1.png'; break;
            default: bankLogoUrl = '';
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
        
        canvas.width = 594; 
        canvas.height = 1200;

        let backgroundImageSrc = '';
        if (isNoteMode) {
            const bgNoteElem = document.getElementById('bg_note');
            backgroundImageSrc = bgNoteElem && bgNoteElem.value ? bgNoteElem.value : 'assets/image/bs/BAY1.1T.jpg';
        } else {
            backgroundImageSrc = backgroundSelect ? backgroundSelect : 'assets/image/bs/BAY1.1.jpg';
        }

        let originalBgSrc = backgroundImageSrc;
        let bgImg = await loadImage(backgroundImageSrc);
        if (!bgImg) bgImg = await loadImage(originalBgSrc);

        const [bankLogoImg, customStickerImg, secondaryLogo] = await Promise.all([
            loadImage(bankLogoUrl),
            loadImage((selectedImage && !selectedImage.includes('NO.png')) ? selectedImage : null),
            loadImage('assets/image/logo/BAY2.png') // โลโก้ BAY หลักด้านบน
        ]);

        if (bgImg) {
            ctx.clearRect(0, 0, canvas.width, canvas.height);
            ctx.drawImage(bgImg, 0, 0, canvas.width, canvas.height);
        } else {
            ctx.fillStyle = '#1e293b'; ctx.fillRect(0, 0, canvas.width, canvas.height);
            ctx.fillStyle = '#ff4d4f'; ctx.font = '20px krungsriBold';
            ctx.fillText('❌ หาไฟล์พื้นหลังไม่เจอ!', 50, canvas.height / 2);
        }

        if (bankLogoImg) ctx.drawImage(bankLogoImg, 44.7, 313.2, 75.5, 75.5);
        if (secondaryLogo) ctx.drawImage(secondaryLogo, 44.7, 184.5, 75.5, 75.5);

        drawText(ctx, `${formattedDate} ${formattedTime}`, 176, 115.1, 18.50, 'krungsriRegular', '#727171', 'left', 1.5, 3, 0, 0, 800, 0);

        drawText(ctx, `${sendername}`, 544, 210.8, 21.20, 'krungsriBold', '#000000', 'right', 1.5, 3, 0, 0, 800, 0);
        drawText(ctx, `${senderaccount}`, 544, 244.4, 20.5, 'krungsriRegular', '#848583', 'right', 1.5, 1, 0, 0, 500, 0.50);

        drawText(ctx, `${receivername}`, 544, 339.5, 21.20, 'krungsriBold', '#000000', 'right', 1.5, 3, 0, 0, 800, 0);
        drawText(ctx, `${receiveraccount}`, 544, 373.0, 20.5, 'krungsriRegular', '#848583', 'right', 1.5, 1, 0, 0, 500, 0.50);

        drawText(ctx, `${amount11} THB`, 544, 454.8, 32.7, 'krungsriBold', '#000000', 'right', 1.5, 1, 0, 0, 500, -0.25);
        drawText(ctx, `0.00 THB`, 544, 495.4, 20.5, 'krungsriRegular', '#848583', 'right', 1.5, 1, 0, 0, 500, 0.25);

        if (isNoteMode) {
            drawText(ctx, `${generateUniqueID()}`, 49.5, 597.8, 20.50, 'krungsriBold', '#000000', 'left', 1.5, 3, 0, 0, 500, 0);
            drawText(ctx, `${AideMemoire}`, 544, 790.8, 19.50, 'krungsriBold', '#000000', 'right', 1.5, 1, 0, 0, 500, 0);
        } else {
            drawText(ctx, `${generateUniqueID()}`, 49.5, 597.8, 20.50, 'krungsriMedium', '#000000', 'left', 1.5, 3, 0, 0, 500, 0);
        }

        drawText(ctx, `${QRCode}`, 238.9, 520.0, 33, 'krungsriRegular', '#4e4e4e', 'left', 1.5, 5, 0, 0, 500, 0);

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
        if (!canvas) return;
        const link = document.createElement('a');
        link.href = canvas.toDataURL('image/png');
        link.download = 'slip_bay.png';
        link.click();
    };

})();