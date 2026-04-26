(function() {
    const fontPath = 'assets/fonts';
    let fontsLoaded = false;

    async function loadFonts() {
        const fonts = [
            new FontFace('BaacBold', `url(${fontPath}/Baac_Bold.woff)`)
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
        let year = formattedDate.split(' ')[2];
        year = `25${year}`;
        return `${day} ${month} ${year}`;
    }

    function generateUniqueID() {
        const prefix = "MTI00"; 
        const part1 = Math.floor(Math.random() * 1000000000).toString().padStart(9, '0'); 
        const part2 = Math.floor(Math.random() * 100000000000).toString().padStart(11, '0'); 
        return `${prefix}${part1}${part2}`;
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
        const amount11 = getInputValue('amount11', '0.00');
        
        const datetimeVal = document.getElementById('datetime-input')?.value || document.getElementById('datetime')?.value || '-';
        const datetime = datetimeVal;

        const AideMemoire = getInputValue('AideMemoire', '-');
        const selectedImage = getInputValue('imageSelect', '');
        const QRCode = getInputValue('QRCode', '');

        const noteToggleElem = document.getElementById('modeSwitch');
        const isNoteMode = noteToggleElem ? noteToggleElem.checked : false;

        const formattedDate = formatDate(datetime);
        let formattedTime = '';
        if (datetime && datetime !== '-') {
            const d = new Date(datetime);
            if (!isNaN(d.getTime())) formattedTime = d.toLocaleTimeString('th-TH', { hour: '2-digit', minute: '2-digit', second: '2-digit' });
        }

        const canvas = document.getElementById('canvas');
        if (!canvas) return;
        const ctx = canvas.getContext('2d');
        
        canvas.width = 782;
        canvas.height = 1280;

        const backgroundImageSrc = isNoteMode ? 'assets/image/bs/A3T.jpg' : 'assets/image/bs/A3.jpg';

        const [bgImg, customStickerImg] = await Promise.all([
            loadImage(backgroundImageSrc),
            loadImage((selectedImage && !selectedImage.includes('NO.png')) ? selectedImage : null)
        ]);

        if (bgImg) {
            ctx.clearRect(0, 0, canvas.width, canvas.height);
            ctx.drawImage(bgImg, 0, 0, canvas.width, canvas.height);
        } else {
            ctx.fillStyle = '#064e3b'; ctx.fillRect(0, 0, canvas.width, canvas.height);
            ctx.fillStyle = '#ffffff'; ctx.font = '30px BaacBold';
            ctx.fillText('❌ หาไฟล์พื้นหลังไม่เจอ!', 50, canvas.height / 2);
        }

        if (isNoteMode) {
            drawText(ctx, `${formattedDate}  ${formattedTime}`, 391, 296.3, 39, 'BaacBold', '#4a4a4a', 'center', 50, 3, 0, 0, 800, 0);
            drawText(ctx, `รหัสทำรายการ  ${generateUniqueID()}`, 391, 334.8, 39, 'BaacBold', '#4a4a4a', 'center', 50, 3, 0, 0, 800, 0);

            drawText(ctx, `${sendername}`, 718.2, 415, 50, 'BaacBold', '#000000', 'right', 50, 3, 0, 0, 800, -0.50);
            drawText(ctx, `${senderaccount}`, 718.2, 463.3, 50, 'BaacBold', '#000000', 'right', 50, 1, 0, 0, 800, -0.50);
            
            drawText(ctx, `${bank}`, 718.2, 579, 50, 'BaacBold', '#000000', 'right', 50, 2, 0, 0, 800, 0);
            drawText(ctx, `${receivername}`, 718.2, 626.5, 50, 'BaacBold', '#000000', 'right', 50, 3, 0, 0, 800, -0.50);
            drawText(ctx, `${receiveraccount}`, 718.2, 672.2, 50, 'BaacBold', '#000000', 'right', 50, 1, 0, 0, 800, -0.50);
            
            drawText(ctx, `${AideMemoire}`, 718.2, 745, 50, 'BaacBold', '#000000', 'right', 50, 1, 0, 0, 800, -0.50);

            drawText(ctx, `${amount11} บาท`, 718.2, 835, 50, 'BaacBold', '#000000', 'right', 50, 3, 0, 0, 800, 0);
            drawText(ctx, `0.00 บาท`, 718.2, 906.4, 50, 'BaacBold', '#000000', 'right', 50, 3, 0, 0, 800, 0);
        } else {
            drawText(ctx, `${formattedDate}  ${formattedTime}`, 391, 296.3, 39, 'BaacBold', '#4a4a4a', 'center', 50, 3, 0, 0, 800, 0);
            drawText(ctx, `รหัสทำรายการ  ${generateUniqueID()}`, 391, 334.8, 39, 'BaacBold', '#4a4a4a', 'center', 50, 3, 0, 0, 800, 0);

            drawText(ctx, `${sendername}`, 718.2, 414.5, 50, 'BaacBold', '#000000', 'right', 50, 3, 0, 0, 800, -0.50);
            drawText(ctx, `${senderaccount}`, 718.2, 463.3, 50, 'BaacBold', '#000000', 'right', 50, 1, 0, 0, 800, -0.50);
            
            drawText(ctx, `${bank}`, 718.2, 579, 50, 'BaacBold', '#000000', 'right', 50, 2, 0, 0, 800, 0);
            drawText(ctx, `${receivername}`, 718.2, 626.5, 50, 'BaacBold', '#000000', 'right', 50, 3, 0, 0, 800, -0.50);
            drawText(ctx, `${receiveraccount}`, 718.2, 672.2, 50, 'BaacBold', '#000000', 'right', 50, 1, 0, 0, 800, -0.50);
            
            drawText(ctx, `${amount11} บาท`, 718.2, 765.6, 50, 'BaacBold', '#000000', 'right', 50, 3, 0, 0, 800, 0);
            drawText(ctx, `0.00 บาท`, 718.2, 835, 50, 'BaacBold', '#000000', 'right', 50, 3, 0, 0, 800, 0);
        }

        if (QRCode) {
            // (พิกัดสมมติ หากต้องการให้มี QR ในอนาคต ให้ปรับแก้ตรงนี้)
            drawText(ctx, `${QRCode}`, 238.9, 599.0, 30, 'BaacBold', '#4e4e4e', 'left', 1.5, 5, 0, 0, 500, 0);
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
        link.download = 'slip_baac.png';
        link.click();
    };

})();