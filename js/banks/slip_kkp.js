// js/banks/slip_kkp.js

(function() {
    const fontPath = 'assets/fonts';
    let fontsLoaded = false;

    async function loadFonts() {
        const fonts = [
            new FontFace('KanitThin', `url(${fontPath}/Kanit-Thin.woff)`),
            new FontFace('KanitExtraLight', `url(${fontPath}/Kanit-ExtraLight.woff)`),
            new FontFace('KanitLight', `url(${fontPath}/Kanit-Light.woff)`),
            new FontFace('KanitRegular', `url(${fontPath}/Kanit-Regular.woff)`),
            new FontFace('KanitMedium', `url(${fontPath}/Kanit-Medium.woff)`),
            new FontFace('KanitSemiBold', `url(${fontPath}/Kanit-SemiBold.woff)`),
            new FontFace('KanitBold', `url(${fontPath}/Kanit-Bold.woff)`),
            new FontFace('KanitExtraBold', `url(${fontPath}/Kanit-ExtraBold.woff)`),
            new FontFace('KanitBlack', `url(${fontPath}/Kanit-Black.woff)`)
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
        const options = { day: 'numeric', month: 'short', year: '2-digit' };
        let formattedDate = new Date(date).toLocaleDateString('th-TH', options);
        formattedDate = formattedDate.replace(/ /g, ' ').replace(/\./g, '');
        const months = ['ม.ค.', 'ก.พ.', 'มี.ค.', 'เม.ย.', 'พ.ค.', 'มิ.ย.', 'ก.ค.', 'ส.ค.', 'ก.ย.', 'ต.ค.', 'พ.ย.', 'ธ.ค.'];
        const parts = formattedDate.split(' ');
        if (parts.length < 3) return formattedDate;
        const day = padZero(parts[0]);
        const month = months[new Date(date).getMonth()];
        const year = parts[2];
        return `${day} ${month} ${year}`;
    }

    function generateUniqueID() {
        const prefix = "522";  
        const characters = "123456789";  
        let uniqueID = "";
        for (let i = 0; i < 9; i++) {
            const randomIndex = Math.floor(Math.random() * characters.length);
            uniqueID += characters[randomIndex];
        }
        return `${prefix}${uniqueID}`;
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
        const amount11 = getInputValue('amount11', '-');
        
        const datetimeVal = document.getElementById('datetime-input')?.value || document.getElementById('datetime')?.value || '-';
        const datetime = datetimeVal;

        const AideMemoire = getInputValue('AideMemoire', '');
        const selectedImage = getInputValue('imageSelect', '');
        const QRCode = getInputValue('QRCode', '');

        const noteToggleElem = document.getElementById('modeSwitch');
        const isNoteMode = noteToggleElem ? noteToggleElem.checked : false;

        let bankLogoUrl = '';
        switch (bank) {
            case 'ธ.กสิกรไทย จำกัด (มหาชน)': bankLogoUrl = 'assets/image/logo/K-KBANK.png'; break;
            case 'ธ.กรุงไทย จำกัด (มหาชน)': bankLogoUrl = 'assets/image/logo/K-KTB.png'; break;
            case 'ธ.กรุงเทพ จำกัด (มหาชน)': bankLogoUrl = 'assets/image/logo/K-BBL.png'; break;
            case 'ธ.ไทยพาณิชย์ จำกัด (มหาชน)': bankLogoUrl = 'assets/image/logo/K-SCB.png'; break;
            case 'ธ.กรุงศรีอยุธยา จำกัด (มหาชน)': bankLogoUrl = 'assets/image/logo/K-BAY.png'; break;
            case 'ธ.ทหารไทยธนชาต จำกัด (มหาชน)': bankLogoUrl = 'assets/image/logo/K-TTB.png'; break;
            case 'ธ.ออมสิน': bankLogoUrl = 'assets/image/logo/K-O.png'; break;
            case 'ธ.ก.ส.': bankLogoUrl = 'assets/image/logo/K-T.png'; break;
            case 'ธ.อาคารสงเคราะห์': bankLogoUrl = 'assets/image/logo/K-C.png'; break;
            case 'ธ.เกียรตินาคินภัทร': bankLogoUrl = 'assets/image/logo/K-K.png'; break;
            case 'ธ.ซีไอเอ็มบี ไทย จำกัด (มหาชน)': bankLogoUrl = 'assets/image/logo/K-CIMB.png'; break;
            case 'ธ.ยูโอบี จำกัด (มหาชน)': bankLogoUrl = 'assets/image/logo/K-UOB.png'; break;
            case 'ธ.แลนด์ แอนด์ เฮ้าส์ จำกัด (มหาชน)': bankLogoUrl = 'assets/image/logo/K-LHBANK.png'; break;
            case 'ธ.ไอซีบีซี (ไทย) จำกัด (มหาชน)': bankLogoUrl = 'assets/image/logo/K-ICBC.png'; break;
            case 'พร้อมเพย์': bankLogoUrl = 'assets/image/logo/P-Kiatnakin.png'; break;
            case 'เติมเงินพร้อมเพย์ วอลเล็ท': bankLogoUrl = 'assets/image/logo/P-Kiatnakin.png'; break;
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

        let backgroundImageSrc = 'assets/image/bs/KKP1.jpg';

        if (bank === 'เติมเงินพร้อมเพย์ วอลเล็ท') {
            canvas.width = 748;
            canvas.height = 1280;
            backgroundImageSrc = 'assets/image/bs/KKP1.1.jpg';
        } else {
            canvas.width = 748;
            canvas.height = 1280;
            backgroundImageSrc = 'assets/image/bs/KKP1.jpg';
        }

        let bgImg = await loadImage(backgroundImageSrc);
        const [bankLogoImg, customStickerImg, mainLogoImg] = await Promise.all([
            loadImage(bankLogoUrl),
            loadImage((selectedImage && !selectedImage.includes('NO.png')) ? selectedImage : null),
            loadImage('assets/image/logo/K-K.png')
        ]);

        if (bgImg) {
            ctx.clearRect(0, 0, canvas.width, canvas.height);
            ctx.drawImage(bgImg, 0, 0, canvas.width, canvas.height);
        } else {
            ctx.fillStyle = '#1e293b'; ctx.fillRect(0, 0, canvas.width, canvas.height);
            ctx.fillStyle = '#ff4d4f'; ctx.font = '30px KanitBold';
            ctx.fillText('❌ หาไฟล์พื้นหลังไม่เจอ!', 50, canvas.height / 2);
        }

        if(bankLogoImg) ctx.drawImage(bankLogoImg, 33, 506, 172, 172); 
        
        drawText(ctx, `${formattedDate} ${formattedTime} น.`, 373, 151.3, 33, 'KanitRegular', '#ffffff', 'center', 1.5, 3, 0, 0, 500, 0);

        drawText(ctx, `${sendername}`, 237, 307.1, 38.7, 'KanitMedium', '#33286c', 'left', 1.5, 3, 0, 0, 500, 0);
        drawText(ctx, `ธ.เกียรตินาคินภัทร`, 237, 254, 29.7, 'KanitRegular', '#929196', 'left', 1.5, 2, 0, 0, 500, 0);
        drawText(ctx, `${senderaccount}`, 237, 363, 38, 'KanitRegular', '#6b629b', 'left', 1.5, 1, 0, 0, 500, 0);
        
        if (bank === 'เติมเงินพร้อมเพย์ วอลเล็ท') {
            drawText(ctx, `${receivername}`, 237, 598.6, 38.7, 'KanitMedium', '#33286c', 'left', 1.5, 3, 0, 0, 500, 0);
            drawText(ctx, `${bank}`, 237, 545.5, 29.7, 'KanitRegular', '#929196', 'left', 1.5, 2, 0, 0, 500, 0);
            drawText(ctx, `${receiveraccount}`, 237, 653.1, 38, 'KanitRegular', '#6b629b', 'left', 1.5, 1, 0, 0, 500, 0);

            drawText(ctx, `${amount11}`, 237, 838.7, 56, 'KanitRegular', '#33286c', 'left', 1.5, 3, 0, 0, 500, 0);
            drawText(ctx, `THB`, 237 + ctx.measureText(`${amount11}`).width + 16, 838.7, 34, 'KanitRegular', '#33286c', 'left', 1.5, 3, 0, 0, 500, 0);
            
            drawText(ctx, `0.00 THB`, 710, 952, 32, 'KanitRegular', '#33286c', 'right', 1.5, 3, 0, 0, 500, 0);
            drawText(ctx, `${formattedDate}`, 710, 1000 , 32, 'KanitRegular', '#58575c', 'right', 1.5, 3, 0, 0, 500, 0);
            drawText(ctx, `${generateUniqueID()}`, 710, 1049, 32, 'KanitRegular', '#58575c', 'right', 1.5, 3, 0, 0, 500, 0);

            if (isNoteMode) {
                drawText(ctx, `${AideMemoire}`, 224, 1200.7, 32, 'KanitRegular', '#545454', 'left', 1.5, 1, 0, 0, 500, 0);
            }

            drawText(ctx, `${QRCode}`, 238.9, 599.0, 33, 'KanitRegular', '#4e4e4e', 'left', 1.5, 5, 0, 0, 500, 0);
            if(mainLogoImg) ctx.drawImage(mainLogoImg, 33, 215.5, 172, 172);  
        } else {
            drawText(ctx, `${receivername}`, 237, 598.6, 38.7, 'KanitMedium', '#33286c', 'left', 1.5, 3, 0, 0, 500, 0);
            
            const bankSelectElem = document.getElementById('bank');
            let bankTextLabel = bank;
            if (bankSelectElem && bankSelectElem.selectedIndex >= 0) {
                bankTextLabel = bankSelectElem.options[bankSelectElem.selectedIndex].text;
            }
            drawText(ctx, `${bankTextLabel}`, 237, 545.5, 29.7, 'KanitRegular', '#929196', 'left', 1.5, 2, 0, 0, 500, 0);
            
            drawText(ctx, `${receiveraccount}`, 237, 653.1, 38, 'KanitRegular', '#6b629b', 'left', 1.5, 1, 0, 0, 500, 0);

            drawText(ctx, `${amount11}`, 237, 838.7, 56, 'KanitRegular', '#33286c', 'left', 1.5, 3, 0, 0, 500, 0);
            drawText(ctx, `THB`, 237 + ctx.measureText(`${amount11}`).width + 16, 838.7, 34, 'KanitRegular', '#33286c', 'left', 1.5, 3, 0, 0, 500, 0);
            
            drawText(ctx, `0.00 THB`, 710, 952, 32, 'KanitRegular', '#33286c', 'right', 1.5, 3, 0, 0, 500, 0);
            drawText(ctx, `${formattedDate}`, 710, 1000 , 32, 'KanitRegular', '#58575c', 'right', 1.5, 3, 0, 0, 500, 0);
            drawText(ctx, `${generateUniqueID()}`, 710, 1049, 32, 'KanitRegular', '#58575c', 'right', 1.5, 3, 0, 0, 500, 0);

            if (isNoteMode) {
                drawText(ctx, `${AideMemoire}`, 224, 1200.7, 32, 'KanitRegular', '#545454', 'left', 1.5, 1, 0, 0, 500, 0);
            }

            drawText(ctx, `${QRCode}`, 238.9, 599.0, 33, 'KanitRegular', '#4e4e4e', 'left', 1.5, 5, 0, 0, 500, 0);
            if(mainLogoImg) ctx.drawImage(mainLogoImg, 33, 215.5, 172, 172);  
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
        link.download = 'slip_kkp.png';
        link.click();
    }

})();