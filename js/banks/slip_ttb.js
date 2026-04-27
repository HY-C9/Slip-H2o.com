// js/banks/slip_ttb.js
// รวมระบบสร้างสลิป TTB (ทหารไทยธนชาต) ทั้งโหมดปกติ และ โหมดบันทึกช่วยจำ (Note)

(function() {
    const fontPath = 'assets/fonts';
    let fontsLoaded = false;

    async function loadFonts() {
        const fonts = [
            new FontFace('DXTTBBold', `url(${fontPath}/DX-TTB-bold.woff)`),
            new FontFace('DXTTBRegular', `url(${fontPath}/DX-TTB-regular.woff)`),
            new FontFace('TTBMoneyRegular', `url(${fontPath}/TTB-Money-Regular.woff)`),
            new FontFace('TTBMoneyMedium', `url(${fontPath}/TTB-Money-Medium.woff)`),
            new FontFace('TTBMoneySemiBold', `url(${fontPath}/TTB-Money-SemiBold.woff)`),
            new FontFace('TTBMoneyBold', `url(${fontPath}/TTB-Money-Bold.woff)`),
            new FontFace('TTBMoneyExtraBold', `url(${fontPath}/TTB-Money-ExtraBold.woff)`)
        ];
        return Promise.all(fonts.map(font => font.load().catch(e => console.warn('Font load error:', e)))).then(function(loadedFonts) {
            loadedFonts.forEach(function(font) {
                if (font) document.fonts.add(font);
            });
        });
    }

    function ensureFontsLoaded() {
        if (fontsLoaded) return Promise.resolve();
        return loadFonts().then(() => { fontsLoaded = true; });
    }

    function padZero(number) { return number < 10 ? '0' + number : number; }

    function formatDate(date) {
        if (!date || date === '-') return '-';
        const d = new Date(date);
        if (isNaN(d.getTime())) return '-';
        const day = d.getDate().toString().padStart(2, '0');
        const months = ['ม.ค.', 'ก.พ.', 'มี.ค.', 'เม.ย.', 'พ.ค.', 'มิ.ย.', 'ก.ค.', 'ส.ค.', 'ก.ย.', 'ต.ค.', 'พ.ย.', 'ธ.ค.'];
        const month = months[d.getMonth()];
        const yearBE = (d.getFullYear() + 543).toString().slice(-2); 
        return `${day} ${month} ${yearBE}`;
    }

    function generateUniqueID() {
        const now = new Date(document.getElementById('datetime-input')?.value || new Date());
        const year = now.getFullYear().toString().slice(-4);
        const month = padZero(now.getMonth() + 1);
        const day = padZero(now.getDate());
        const hours = padZero(now.getHours());
        const randomNumber = Math.floor(Math.random() * 100000000).toString().padStart(8, '0');
        return `${year}${month}${day}${hours}${randomNumber}`;
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

                    if (testWidth > maxWidth) {
                        lines.push(currentLine.trim());
                        currentLine = char;
                    } else {
                        currentLine = testLine;
                    }
                } else {
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

    // ==========================================
    // 3. ฟังก์ชันหลักสำหรับวาด Canvas
    // ==========================================
    async function renderSlipDisplay() {
        const sendername = getInputValue('sendername', '-');
        const senderaccount = getInputValue('senderaccount', '-');
        const receivername = getInputValue('receivername', '-');
        const receiveraccount = getInputValue('receiveraccount', '-');
        const Itemcode = getInputValue('Itemcode', '-');
        const amount11 = getInputValue('amount11', '-');
        const amountDecimal = getInputValue('amountDecimal', '-');
        const datetime = document.getElementById('datetime-input')?.value || document.getElementById('datetime')?.value || '-';
        const QRCode = getInputValue('QRCode', '');
        const AideMemoire = getInputValue('AideMemoire', '-');

        const noteToggleElem = document.getElementById('modeSwitch');
        const isNoteMode = noteToggleElem ? noteToggleElem.checked : false;

        const selectedImage = getInputValue('imageSelect', '');
        let backgroundSelect = getInputValue('backgroundSelect', '');

        // 🟢 ดึงค่าทั้ง value และ text ควบคู่กัน เพื่อป้องกันการหาโลโก้ไม่เจอ
        const bankSelectElem = document.getElementById('bank');
        const bankValue = bankSelectElem ? bankSelectElem.value.trim() : '-';
        const bankTextLabel = (bankSelectElem && bankSelectElem.selectedIndex >= 0) 
            ? bankSelectElem.options[bankSelectElem.selectedIndex].text.trim() 
            : bankValue;

        const checkBankStr = (bankValue + " " + bankTextLabel).toUpperCase();
        let bankLogoUrl = '';

        if (checkBankStr.includes('KBANK') || checkBankStr.includes('กสิกรไทย')) bankLogoUrl = 'assets/image/logo/KBANK1.3.png';
        else if (checkBankStr.includes('KTB') || checkBankStr.includes('กรุงไทย')) bankLogoUrl = 'assets/image/logo/KTB2.png';
        else if (checkBankStr.includes('BBL') || checkBankStr.includes('กรุงเทพ')) bankLogoUrl = 'assets/image/logo/BBL4.png';
        else if (checkBankStr.includes('SCB') || checkBankStr.includes('ไทยพาณิชย์')) bankLogoUrl = 'assets/image/logo/SCB.png';
        else if (checkBankStr.includes('BAY') || checkBankStr.includes('กรุงศรี')) bankLogoUrl = 'assets/image/logo/BAY2.1.png';
        else if (checkBankStr.includes('TTB') || checkBankStr.includes('ทหารไทยธนชาต')) bankLogoUrl = 'assets/image/logo/TTB2.png';
        else if (checkBankStr.includes('GSB') || checkBankStr.includes('ออมสิน')) bankLogoUrl = 'assets/image/logo/O2.png';
        else if (checkBankStr.includes('BAAC') || checkBankStr.includes('ธ.ก.ส.')) bankLogoUrl = 'assets/image/logo/T2.png';
        else if (checkBankStr.includes('GHB') || checkBankStr.includes('อาคารสงเคราะห์')) bankLogoUrl = 'assets/image/logo/C1.png';
        else if (checkBankStr.includes('KKP') || checkBankStr.includes('เกียรตินาคิน')) bankLogoUrl = 'assets/image/logo/K1.png';
        else if (checkBankStr.includes('CIMB') || checkBankStr.includes('ซีไอเอ็มบี')) bankLogoUrl = 'assets/image/logo/CIMB.png';
        else if (checkBankStr.includes('UOB') || checkBankStr.includes('ยูโอบี')) bankLogoUrl = 'assets/image/logo/UOB4.png';
        else if (checkBankStr.includes('LH BANK') || checkBankStr.includes('แลนด์ แอนด์ เฮาส์')) bankLogoUrl = 'assets/image/logo/LHBANK1.png';
        else if (checkBankStr.includes('ICBC') || checkBankStr.includes('ไอซีบีซี')) bankLogoUrl = 'assets/image/logo/ICBC.png';
        else if (checkBankStr.includes('CHILLPAY')) bankLogoUrl = 'assets/image/logo/CP-TTB.png';
        else if (checkBankStr.includes('พร้อมเพย์') || checkBankStr.includes('PROMPTPAY')) {
            bankLogoUrl = 'assets/image/logo/P-TTB1.png'; 
        }
        const isEWallet = checkBankStr.includes('E-WALLET') || checkBankStr.includes('EWALLET') || checkBankStr.includes('วอเล็ท') || checkBankStr.includes('วอลเล็ท');
        const isChillPay = checkBankStr.includes('CHILLPAY');

        const formattedDate = formatDate(datetime);
        let formattedTime = '';
        if (datetime && datetime !== '-') {
            const d = new Date(datetime);
            if (!isNaN(d.getTime())) formattedTime = d.toLocaleTimeString('th-TH', { hour: '2-digit', minute: '2-digit' });
        }

        const canvas = document.getElementById('canvas');
        if (!canvas) return;
        const ctx = canvas.getContext('2d');

        // ==========================================
        // จัดการพื้นหลัง (อิงจาก dropdown/โหมด)
        // ==========================================
        let backgroundImageSrc = backgroundSelect;

        if (isNoteMode) {
            const bgNoteElem = document.getElementById('bg_note');
            if (bgNoteElem && bgNoteElem.value) {
                backgroundImageSrc = bgNoteElem.value;
            } else if (!backgroundImageSrc.includes('T.jpg')) {
                backgroundImageSrc = backgroundImageSrc.replace('.jpg', 'T.jpg');
            }
            
            if (isEWallet) {
                canvas.width = 714; canvas.height = 1320;
                backgroundImageSrc = backgroundImageSrc.replace('/T', '/TT');
            } else if (isChillPay) {
                canvas.width = 714; canvas.height = 1320;
                backgroundImageSrc = backgroundImageSrc.replace('/T', '/CT');
            } else {
                canvas.width = 714; canvas.height = 1280;
            }
            
        } else {
            if (backgroundImageSrc.includes('T.jpg')) {
                backgroundImageSrc = backgroundImageSrc.replace('T.jpg', '.jpg');
            }
            
            if (isEWallet) {
                canvas.width = 752; canvas.height = 1320;
                backgroundImageSrc = backgroundImageSrc.replace('/T', '/TT');
            } else if (isChillPay) {
                canvas.width = 752; canvas.height = 1320;
                backgroundImageSrc = backgroundImageSrc.replace('/T', '/CT');
            } else {
                canvas.width = 752; canvas.height = 1280;
            }
        }

        let originalBgSrc = backgroundImageSrc;
        let bgImg = await loadImage(backgroundImageSrc);
        if (!bgImg) bgImg = await loadImage(originalBgSrc);

        const [bankLogoImg, senderLogoImg, customStickerImg] = await Promise.all([
            loadImage(bankLogoUrl),
            loadImage('assets/image/logo/TTB2.png'), 
            loadImage((selectedImage && !selectedImage.includes('NO.png')) ? selectedImage : null)
        ]);

        if (bgImg) {
            ctx.clearRect(0, 0, canvas.width, canvas.height);
            ctx.drawImage(bgImg, 0, 0, canvas.width, canvas.height);
        } else {
            ctx.fillStyle = '#1e293b'; ctx.fillRect(0, 0, canvas.width, canvas.height);
            ctx.fillStyle = '#ff4d4f'; ctx.font = '30px DXTTBBold';
            ctx.fillText('❌ หาไฟล์พื้นหลังไม่เจอ!', 50, canvas.height / 2 - 20);
            ctx.fillStyle = '#ffffff'; ctx.font = '20px DXTTBRegular';
            ctx.fillText(backgroundImageSrc, 50, canvas.height / 2 + 20);
        }

        const modifiedReceiverName = receivername.replace(/\s+/g, '');
        const amountText = `${amount11}`;
        const amountUnit = `${amountDecimal}`;
        const totalText = amountText + ' ' + amountUnit;

        if (isNoteMode) {
            if(bankLogoImg) ctx.drawImage(bankLogoImg, 49.5, 740.7, 80.0, 80.0);
            if(senderLogoImg) ctx.drawImage(senderLogoImg, 49.5, 565.1, 80.0, 80.0);
            
            drawText(ctx, `${formattedDate}, ${formattedTime} น.`, 356, 400.8, 21.33, 'DXTTBRegular', '#9099a2', 'center', 1.5, 3, 0, 0, 800, 0);

            drawText(ctx, `${sendername}`, 138.5, 598.5, 24.3, 'DXTTBBold', '#0a2e6c', 'left', 1.5, 3, 0, 0, 800, 0);
            drawText(ctx, `${senderaccount}`, 138.5, 637.8, 24.3, 'DXTTBRegular', '#7d8085', 'left', 1.5, 1, 0, 0, 500, 0);
            drawText(ctx, `ttb`, 138.5, 678.1, 24.3, 'DXTTBRegular', '#7d8085', 'left', 1.5, 2, 0, 0, 500, 0);

            if (isEWallet) {
                drawText(ctx, `พร้อมเพย์ e-Wallet`, 138.5, 772.7, 24.3, 'DXTTBBold', '#0a2e6c', 'left', 1.5, 3, 0, 0, 800, 0);
                drawText(ctx, `(EW01)`, 138.5, 811.9, 24.3, 'DXTTBRegular', '#0a2e6c', 'left', 1.5, 1, 0, 0, 500, 0);
                drawText(ctx, `${receiveraccount}`, 138.5, 850.9, 24.3, 'DXTTBRegular', '#7d8085', 'left', 1.5, 1, 0, 0, 500, 0);
                drawText(ctx, `${receivername}`, 138.5, 889.9, 24.3, 'DXTTBRegular', '#7d8085', 'left', 1.5, 3, 0, 0, 800, 0);
                
                drawText(ctx, `${generateUniqueID()}`, 166.9, 1032.7, 21.33, 'DXTTBRegular', '#8e959d', 'left', 1.5, 3, 0, 0, 500, 0);
                drawText(ctx, `${AideMemoire}`, 655, 970.9, 24.3, 'DXTTBBold', '#0a2e6c', 'right', 1.5, 3, 0, 0, 800, 0);

            } else if (isChillPay) {
                drawText(ctx, `ChillPay-${receivername}`, 138.5, 772.7, 24.3, 'DXTTBBold', '#0a2e6c', 'left', 1.5, 3, 0, 0, 800, 0);
                drawText(ctx, `${receiveraccount}`, 138.5, 811.9, 24.3, 'DXTTBRegular', '#0a2e6c', 'left', 1.5, 1, 0, 0, 500, 0);
                drawText(ctx, `${Itemcode}`, 138.5, 850.9, 24.3, 'DXTTBRegular', '#7d8085', 'left', 1.5, 1, 0, 0, 500, 0);
                drawText(ctx, `${modifiedReceiverName}`, 138.5, 889.9, 24.3, 'DXTTBRegular', '#7d8085', 'left', 1.5, 3, 0, 0, 800, 0);

                drawText(ctx, `${generateUniqueID()}`, 166.9, 1032.7, 21.33, 'DXTTBRegular', '#8e959d', 'left', 1.5, 3, 0, 0, 500, 0);
                drawText(ctx, `${AideMemoire}`, 655, 970.9, 24.3, 'DXTTBBold', '#0a2e6c', 'right', 1.5, 3, 0, 0, 800, 0);

            } else {
                drawText(ctx, `${receivername}`, 138.5, 772.7, 24.3, 'DXTTBBold', '#0a2e6c', 'left', 1.5, 3, 0, 0, 800, 0);
                drawText(ctx, `${receiveraccount}`, 138.5, 811.9, 24.3, 'DXTTBRegular', '#7d8085', 'left', 1.5, 1, 0, 0, 500, 0);
                drawText(ctx, `${bankTextLabel}`, 138.5, 850.9, 24.3, 'DXTTBRegular', '#7d8085', 'left', 1.5, 2, 0, 0, 500, 0);
                
                drawText(ctx, `${generateUniqueID()}`, 166.9, 993.0, 21.33, 'DXTTBRegular', '#8e959d', 'left', 1.5, 3, 0, 0, 500, 0);
                drawText(ctx, `${AideMemoire}`, 655, 931.2, 24.3, 'DXTTBBold', '#0a2e6c', 'right', 1.5, 3, 0, 0, 800, 0);
            }

            const centerX = canvas.width / 1.90;
            const amountY = 483.5;
            const amountX = centerX - (ctx.measureText(totalText).width / 0.83);
            drawText(ctx, amountText, amountX, amountY, 58.0, 'DXTTBBold', '#00225c', 'left', 1.5, 3, 0, 0, 500, 0);
            const amountWidth = ctx.measureText(amountText).width;
            drawText(ctx, amountUnit, amountX + amountWidth - 1, amountY, 42.50, 'DXTTBBold', '#00225c', 'left', 1.5, 0, 0, 0, 500, 0);
            drawText(ctx, `${QRCode}`, 238.9, 599.0, 33, 'DXTTBRegular', '#4e4e4e', 'left', 1.5, 5, 0, 0, 500, 0);

        } else {
            if(bankLogoImg) ctx.drawImage(bankLogoImg, 51.5, 777.5, 86.0, 86.0); 
            if(senderLogoImg) ctx.drawImage(senderLogoImg, 51.5, 595.0, 86.0, 86.0);
            
            drawText(ctx, `${formattedDate}, ${formattedTime} น.`, 376, 421.8, 22.33, 'DXTTBRegular', '#9099a2', 'center', 1.5, 3, 0, 0, 800, 0);

            drawText(ctx, `${sendername}`, 145.5, 629.8, 25.3, 'DXTTBBold', '#0a2e6c', 'left', 1.5, 3, 0, 0, 800, 0);
            drawText(ctx, `${senderaccount}`, 145.5, 670.9, 25.3, 'DXTTBRegular', '#7d8085', 'left', 1.5, 1, 0, 0, 500, 0);
            drawText(ctx, `ttb`, 145.5, 713.8, 25.3, 'DXTTBRegular', '#7d8085', 'left', 1.5, 2, 0, 0, 500, 0);

            if (isEWallet) {
                drawText(ctx, `พร้อมเพย์ e-Wallet`, 145.5, 813.4, 25.3, 'DXTTBBold', '#0a2e6c', 'left', 1.5, 2, 0, 0, 500, 0);
                drawText(ctx, `(EW01)`, 145.5, 855.0, 25.3, 'DXTTBRegular', '#0a2e6c', 'left', 1.5, 1, 0, 0, 500, 0);
                drawText(ctx, `${receiveraccount}`, 145.5, 897.5, 25.3, 'DXTTBRegular', '#7d8085', 'left', 1.5, 1, 0, 0, 500, 0);
                drawText(ctx, `${receivername}`, 145.5, 940.0, 25.3, 'DXTTBRegular', '#7d8085', 'left', 1.5, 3, 0, 0, 800, 0);

                drawText(ctx, `${generateUniqueID()}`, 173.1, 1017.5, 22.33, 'TTBMoneyRegular', '#8e959d', 'left', 1.5, 3, 0, 0, 500, 0);
                
                const centerX = canvas.width / 1.97;
                const amountY = 507.8; 
                const amountX = centerX - (ctx.measureText(totalText).width / 0.82);
                drawText(ctx, amountText, amountX, amountY, 59.0, 'DXTTBBold', '#00225c', 'left', 1.5, 3, 0, 0, 500, 0);
                const amountWidth = ctx.measureText(amountText).width;
                drawText(ctx, amountUnit, amountX + amountWidth - 1, amountY, 43.50, 'DXTTBBold', '#00225c', 'left', 1.5, 0, 0, 0, 500, 0);

            } else if (isChillPay) {
                drawText(ctx, `ChillPay-${receivername}`, 145.5, 813.4, 25.3, 'DXTTBBold', '#0a2e6c', 'left', 1.5, 2, 0, 0, 500, 0);
                drawText(ctx, `${receiveraccount}`, 145.5, 855.0, 25.3, 'DXTTBRegular', '#0a2e6c', 'left', 1.5, 1, 0, 0, 500, 0);
                drawText(ctx, `${Itemcode}`, 145.5, 897.5, 25.3, 'DXTTBRegular', '#7d8085', 'left', 1.5, 1, 0, 0, 500, 0);
                drawText(ctx, `${modifiedReceiverName}`, 145.5, 940.0, 25.3, 'DXTTBRegular', '#7d8085', 'left', 1.5, 3, 0, 0, 800, 0);

                drawText(ctx, `${generateUniqueID()}`, 173.1, 1017.5, 22.33, 'TTBMoneyRegular', '#8e959d', 'left', 1.5, 3, 0, 0, 500, 0);
                
                const centerX = canvas.width / 1.97;
                const amountY = 507.8; 
                const amountX = centerX - (ctx.measureText(totalText).width / 0.82);
                drawText(ctx, amountText, amountX, amountY, 59.0, 'DXTTBBold', '#00225c', 'left', 1.5, 3, 0, 0, 500, 0);
                const amountWidth = ctx.measureText(amountText).width;
                drawText(ctx, amountUnit, amountX + amountWidth - 1, amountY, 43.50, 'DXTTBBold', '#00225c', 'left', 1.5, 0, 0, 0, 500, 0);

            } else {
                drawText(ctx, `${receivername}`, 145.5, 813.4, 25.3, 'DXTTBBold', '#0a2e6c', 'left', 1.5, 3, 0, 0, 800, 0);
                drawText(ctx, `${receiveraccount}`, 145.5, 855.0, 25.3, 'DXTTBRegular', '#7d8085', 'left', 1.5, 1, 0, 0, 500, 0);
                drawText(ctx, `${bankTextLabel}`, 145.5, 897.5, 25.3, 'DXTTBRegular', '#7d8085', 'left', 1.5, 2, 0, 0, 500, 0);
                
                drawText(ctx, `${generateUniqueID()}`, 173.1, 978.2, 22.33, 'TTBMoneyRegular', '#8e959d', 'left', 1.5, 3, 0, 0, 500, 0);

                const centerX = canvas.width / 1.97;
                const amountY = 507.8;
                const amountX = centerX - (ctx.measureText(totalText).width / 0.82);
                drawText(ctx, amountText, amountX, amountY, 59.0, 'DXTTBBold', '#00225c', 'left', 1.5, 3, 0, 0, 500, 0);
                const amountWidth = ctx.measureText(amountText).width;
                drawText(ctx, amountUnit, amountX + amountWidth - 1, amountY, 43.50, 'DXTTBBold', '#00225c', 'left', 1.5, 0, 0, 0, 500, 0);
            }

            drawText(ctx, `${QRCode}`, 238.9, 599.0, 33, 'TTBMoneyRegular', '#4e4e4e', 'left', 1.5, 5, 0, 0, 500, 0);
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
        if (!canvas) return;
        const link = document.createElement('a');
        link.href = canvas.toDataURL('image/png');
        link.download = 'slip_ttb.png';
        link.click();
    };

})();
