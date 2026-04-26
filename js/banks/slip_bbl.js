(function() {
    const fontPath = 'assets/fonts';
    let fontsLoaded = false;
    async function loadFonts() {
        const fonts = [
            new FontFace('SukhumvitSetSemiBold', `url(${fontPath}/SukhumvitSet-SemiBold.woff)`),
            new FontFace('SukhumvitSetExtraBold', `url(${fontPath}/SukhumvitSet-Extra%20Bold.woff)`),
            new FontFace('BangkokTime2', `url(${fontPath}/Bangkok-Time2.woff)`),
            new FontFace('BangkokMoneyMedium', `url(${fontPath}/Bangkok-Money-Medium.woff)`),
            new FontFace('CoreSansBold', `url(${fontPath}/Core-Sans-N-65-Bold.woff)`)
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
        const year = parts[2];
        return `${day} ${month} ${year}`;
    }

    function generateUniqueID() {
        const now = new Date(document.getElementById('datetime-input')?.value || new Date());
        const year = now.getFullYear().toString();
        const month = padZero(now.getMonth() + 1);
        const day = padZero(now.getDate());
        const hours = padZero(now.getHours());
        const minutes = padZero(now.getMinutes());
        const seconds = padZero(now.getSeconds());
        const randomNumber = Math.floor(Math.random() * 100000000000).toString().padStart(11, '0');
        return `${year}${month}${day}${hours}${minutes}${seconds}${randomNumber}`;
    }

    function generateRandomNumber() {
        return Math.floor(Math.random() * 1000000).toString().padStart(6, '0');
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

    async function renderSlipDisplay() {
        // รับค่าจาก Form
        const sendername = getInputValue('sendername', '-');
        const senderaccount = getInputValue('senderaccount', '-');
        const receivername = getInputValue('receivername', '-');
        const receiveraccount = getInputValue('receiveraccount', '-');
        const bank = getInputValue('bank', '-');
        const amount11 = getInputValue('amount11', '-');
        
        // รองรับทั้ง datetime-input (โค้ดใหม่) และ datetime (เผื่อมีคนใช้ id เก่า)
        const datetimeVal = document.getElementById('datetime-input')?.value || document.getElementById('datetime')?.value || '-';
        const datetime = datetimeVal;
        
        const QRCode = getInputValue('QRCode', '');
        const AideMemoire = getInputValue('AideMemoire', '');

        const noteToggleElem = document.getElementById('modeSwitch');
        const isNoteMode = noteToggleElem ? noteToggleElem.checked : false;

        let selectedImage = getInputValue('imageSelect', '');

        let bankLogoUrl = '';
        switch (bank) {
            case 'ธนาคารกสิกรไทย': bankLogoUrl = 'assets/image/logo/KBANK.png'; break;
            case 'ธนาคารกรุงไทย': bankLogoUrl = 'assets/image/logo/KTB2.png'; break;
            case 'ธนาคารกรุงเทพ': bankLogoUrl = 'assets/image/logo/BBL2.png'; break;
            case 'ธนาคารไทยพาณิชย์': bankLogoUrl = 'assets/image/logo/SCB.png'; break;
            case 'ธนาคารกรุงศรีอยุธยา': bankLogoUrl = 'assets/image/logo/BAY1.png'; break;
            case 'ธนาคารทหารไทยธนชาต': bankLogoUrl = 'assets/image/logo/TTB.png'; break;
            case 'ธนาคารออมสิน': bankLogoUrl = 'assets/image/logo/O2.png'; break;
            case 'ธนาคารเพื่อการเกษตรและ': bankLogoUrl = 'assets/image/logo/T.png'; break;
            case 'ธนาคารอาคารสงเคราะห์': bankLogoUrl = 'assets/image/logo/C1.png'; break;
            case 'ธนาคารเกียรตินาคินภัทร': bankLogoUrl = 'assets/image/logo/K.png'; break;
            case 'ธนาคารซีไอเอ็มบี': bankLogoUrl = 'assets/image/logo/CIMB.png'; break;
            case 'ธนาคารยูโอบี': bankLogoUrl = 'assets/image/logo/UOB1.png'; break;
            case 'ธนาคารแลนด์ แอนด์ เฮ้าส์': bankLogoUrl = 'assets/image/logo/LHBANK.png'; break;
            case 'ธนาคารไอซีบีซี': bankLogoUrl = 'assets/image/logo/ICBC.png'; break;
            case 'พร้อมเพย์': bankLogoUrl = 'assets/image/logo/P-Bangkok.png'; break;
            case 'พร้อมเพย์ e-Wallet TrueMoney': bankLogoUrl = 'assets/image/logo/P-Bangkok.png'; break;
            case 'พร้อมเพย์ e-Wallet Jaew': bankLogoUrl = 'assets/image/logo/P-Bangkok.png'; break;
            case 'พร้อมเพย์ e-Wallet K Plus Wallet': bankLogoUrl = 'assets/image/logo/P-Bangkok.png'; break;
            case 'MetaAds': bankLogoUrl = 'assets/image/logo/Meta2.png'; break;
            default: bankLogoUrl = '';
        }

        let coords = {};
        if (isNoteMode) {
            coords = {
                canvasW_normal: 572, canvasH_normal: 1200,
                canvasW_ewallet: 572, canvasH_ewallet: 1262,
                logoMainX: 151.5, logoMainY: 503.0, logoMainSize: 39,
                logoBankX: 151.5, logoBankY: 625.5, logoBankSize: 39,
                dateX: 285, dateY: 333.8, dateSize: 22.50, dateSpace: -0.50,
                senderX: 210.5,
                senderNameY: 528.0, senderNameSize: 23.3,
                senderBankY: 588.4, senderBankSize: 22.0,
                senderAccY: 558.4, senderAccSize: 22.5,
                receiverX: 210.5,
                amountY: 433.3, amountSize: 34.94, unitSize: 20.50,
                qrTextX: 238.9, qrTextY: 599.0, qrSize: 33,
                randX: 44.8, uniqX: 44.8
            };
            
            if (selectedImage && selectedImage.includes('StickerslipBBL')) {
                selectedImage = selectedImage.replace(/StickerslipBBL(\d+)\.png/, (match, p1) => {
                    return `StickerslipBBL${parseInt(p1) + 10}.png`;
                });
            }
        } else {
            coords = {
                canvasW_normal: 607, canvasH_normal: 1200,
                canvasW_ewallet: 607, canvasH_ewallet: 1280,
                logoMainX: 160.5, logoMainY: 531.5, logoMainSize: 43,
                logoBankX: 160.5, logoBankY: 664.0, logoBankSize: 43,
                dateX: 303, dateY: 353.1, dateSize: 23.50, dateSpace: -1,
                senderX: 224.1,
                senderNameY: 560.4, senderNameSize: 24.3,
                senderBankY: 625.2, senderBankSize: 23.0,
                senderAccY: 593.3, senderAccSize: 23.5,
                receiverX: 224.1,
                amountY: 460.0, amountSize: 35.44, unitSize: 21.00,
                qrTextX: 238.9, qrTextY: 599.0, qrSize: 33,
                randX: 47.2, uniqX: 47.2
            };
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
        
        let backgroundImageSrc = '';
        if (bank === 'พร้อมเพย์ e-Wallet TrueMoney' || bank === 'พร้อมเพย์ e-Wallet Jaew' || bank === 'พร้อมเพย์ e-Wallet K Plus Wallet') {
            canvas.width = coords.canvasW_ewallet;
            canvas.height = coords.canvasH_ewallet;
            backgroundImageSrc = isNoteMode ? 'assets/image/bs/BB1T.jpg' : 'assets/image/bs/BB1.jpg';
        } else if (bank === 'MetaAds') {
            canvas.width = coords.canvasW_ewallet;
            canvas.height = coords.canvasH_ewallet;
            backgroundImageSrc = isNoteMode ? 'assets/image/bs/BB2T.jpg' : 'assets/image/bs/BB2.jpg';
        } else {
            canvas.width = coords.canvasW_normal;
            canvas.height = coords.canvasH_normal;
            backgroundImageSrc = isNoteMode ? 'assets/image/bs/B1T.jpg' : 'assets/image/bs/B1.jpg';
        }

        const [bgImg, bankLogoImg, customStickerImg, mainLogoImg] = await Promise.all([
            loadImage(backgroundImageSrc),
            loadImage(bankLogoUrl),
            loadImage((selectedImage && !selectedImage.includes('NO.png')) ? selectedImage : null),
            loadImage('assets/image/logo/BBL2.png') // โลโก้ BBL ตัวบน
        ]);

        if (bgImg) {
            ctx.clearRect(0, 0, canvas.width, canvas.height);
            ctx.drawImage(bgImg, 0, 0, canvas.width, canvas.height);
        } else {
            ctx.fillStyle = '#1e293b'; ctx.fillRect(0, 0, canvas.width, canvas.height);
            ctx.fillStyle = '#ff4d4f'; ctx.font = '20px SukhumvitSetExtraBold';
            ctx.fillText('❌ หาไฟล์พื้นหลังไม่เจอ!', 50, canvas.height / 2);
        }

        if (bankLogoImg) {
            ctx.drawImage(bankLogoImg, coords.logoBankX, coords.logoBankY, coords.logoBankSize, coords.logoBankSize);
        }

        drawText(ctx, `${formattedDate}, ${formattedTime}`, coords.dateX, coords.dateY, coords.dateSize, 'BangkokTime2', '#8a8a8a', 'center', 1.5, 3, 0, 0, 800, coords.dateSpace);

        drawText(ctx, `${sendername}`, coords.senderX, coords.senderNameY, coords.senderNameSize, 'SukhumvitSetExtraBold', '#101011', 'left', 1.5, 3, 0, 0, 800, 0);
        drawText(ctx, `ธนาคารกรุงเทพ`, coords.senderX, coords.senderBankY, coords.senderBankSize, 'SukhumvitSetSemiBold', '#101011', 'left', 1.5, 2, 0, 0, 500, 0);
        drawText(ctx, `${senderaccount}`, coords.senderX, coords.senderAccY, coords.senderAccSize, 'CoreSansBold', '#101011', 'left', 1.5, 1, 0, 0, 500, 0);
        
        if (bank === 'พร้อมเพย์ e-Wallet TrueMoney' || bank === 'พร้อมเพย์ e-Wallet Jaew' || bank === 'พร้อมเพย์ e-Wallet K Plus Wallet') {
            let recNameY = isNoteMode ? 651.1 : 691.3;
            let recBankY = isNoteMode ? 710.3 : 756.3;
            let recAccY  = isNoteMode ? 778.5 : 828.5;
            let noteY    = isNoteMode ? 928.5 : 0;
            let randY    = isNoteMode ? 1066 : 1073;
            let uniqY    = isNoteMode ? 1126 : 1135;

            drawText(ctx, `${receivername}<br>เติมเงินพร้อมเพย์ / G-Wallet`, coords.receiverX, recNameY, coords.senderNameSize, 'SukhumvitSetExtraBold', '#101011', 'left', (isNoteMode ? 31 : 34), 3, 0, 0, 800, 0);
            
            if (bank === 'พร้อมเพย์ e-Wallet TrueMoney') {
                drawText(ctx, `ทรูมันนี่`, coords.receiverX, recBankY, 19, 'SukhumvitSetSemiBold', '#9d9da5', 'left', 1.5, 3, 0, 0, 800, 0);
            } else if (bank === 'พร้อมเพย์ e-Wallet K Plus Wallet') {
                drawText(ctx, `K Plus Wallet`, coords.receiverX, recBankY, 19, 'SukhumvitSetSemiBold', '#9d9da5', 'left', 1.5, 3, 0, 0, 800, 0);
            }

            drawText(ctx, `${receiveraccount}`, coords.receiverX, recAccY, coords.senderAccSize, 'BangkokTime2', '#101011', 'left', 1.5, 1, 0, 0, 500, 0);
            if (isNoteMode) drawText(ctx, `${AideMemoire}`, 159.3, noteY, 18.10, 'BangkokTime2', '#101011', 'left', 1.5, 3, 0, 0, 500, 0);

            drawText(ctx, `${generateRandomNumber()}`, coords.randX, randY, isNoteMode ? 19.80 : 20.63, 'BangkokTime2', '#101011', 'left', 1.5, 3, 0, 0, 500, -1);
            drawText(ctx, `${generateUniqueID()}`, coords.uniqX, uniqY, isNoteMode ? 19.80 : 20.63, 'BangkokTime2', '#101011', 'left', 1.5, 3, 0, 0, 500, -1);

        } else if (bank === 'MetaAds') {
            let recNameY = isNoteMode ? 651.1 : 691.3;
            let recBankY = isNoteMode ? 681 : 719; 
            let recAccY1 = isNoteMode ? 742 : 785;
            let recAccY2 = isNoteMode ? 802 : 845;
            let noteY    = isNoteMode ? 964 : 0;
            let randY    = isNoteMode ? 1100 : 1107;
            let uniqY    = isNoteMode ? 1162 : 1173;

            drawText(ctx, `META ADS (KGP)`, coords.receiverX, recNameY, coords.senderNameSize, 'SukhumvitSetExtraBold', '#101011', 'left', (isNoteMode ? 31 : 34), 3, 0, 0, 800, 0);
            drawText(ctx, `Biller ID:${receivername}`, coords.receiverX, recBankY, isNoteMode ? 21 : 20, 'SukhumvitSetMedium', '#9d9da5', 'left', 1.5, 3, 0, 0, 800, 0);
            drawText(ctx, `${receiveraccount}`, coords.receiverX, recAccY1, coords.senderAccSize, 'BangkokTime2', '#101011', 'left', 1.5, 1, 0, 0, 500, 0);
            drawText(ctx, `${receiveraccount}`, coords.receiverX, recAccY2, coords.senderAccSize, 'BangkokTime2', '#101011', 'left', 1.5, 1, 0, 0, 500, 0);

            if (isNoteMode) drawText(ctx, `${AideMemoire}`, 159.3, noteY, 18.10, 'BangkokTime2', '#101011', 'left', 1.5, 3, 0, 0, 500, 0);

            drawText(ctx, `${generateRandomNumber()}`, coords.randX, randY, isNoteMode ? 19.80 : 20.63, 'BangkokTime2', '#101011', 'left', 1.5, 3, 0, 0, 500, -1);
            drawText(ctx, `${generateUniqueID()}`, coords.uniqX, uniqY, isNoteMode ? 19.80 : 20.63, 'BangkokTime2', '#101011', 'left', 1.5, 3, 0, 0, 500, -1);

        } else {
            let recNameY = isNoteMode ? 651.1 : 691.3;
            let recBankY = isNoteMode ? 712.0 : 756.3;
            let recAccY  = isNoteMode ? 681.5 : 723.5;
            let noteY    = isNoteMode ? 865.3 : 0;
            let randY    = isNoteMode ? 1004 : 993;
            let uniqY    = isNoteMode ? 1064.5 : 1057;

            drawText(ctx, `${receivername}`, coords.receiverX, recNameY, coords.senderNameSize, 'SukhumvitSetExtraBold', '#101011', 'left', 1.5, 3, 0, 0, 800, 0);
            drawText(ctx, `${bank}`, coords.receiverX, recBankY, coords.senderBankSize, 'SukhumvitSetSemiBold', '#101011', 'left', 1.5, 2, 0, 0, 500, 0);
            drawText(ctx, `${receiveraccount}`, coords.receiverX, recAccY, coords.senderAccSize, 'CoreSansBold', '#101011', 'left', 1.5, 1, 0, 0, 500, 0);
            
            if (isNoteMode) drawText(ctx, `${AideMemoire}`, 159.3, noteY, 18.10, 'BangkokTime2', '#101011', 'left', 1.5, 3, 0, 0, 500, 0);

            drawText(ctx, `${generateRandomNumber()}`, coords.randX, randY, isNoteMode ? 19.80 : 20.63, 'BangkokTime2', '#101011', 'left', 1.5, 3, 0, 0, 500, -1);
            drawText(ctx, `${generateUniqueID()}`, coords.uniqX, uniqY, isNoteMode ? 19.80 : 20.63, 'BangkokTime2', '#101011', 'left', 1.5, 3, 0, 0, 500, -1);
        }

        // วาดจำนวนเงิน
        const amountText = `${amount11}`;
        const amountUnit = 'THB';
        const totalText = amountText + ' ' + amountUnit;
        const centerX = canvas.width / 2;
        const amountX = centerX - (ctx.measureText(totalText).width / 1.25);
        
        drawText(ctx, amountText, amountX, coords.amountY, coords.amountSize, 'BangkokMoneyMedium', '#232121', 'left', 1.5, 3, 0, 0, 500, -1);
        const amountWidth = ctx.measureText(amountText).width;
        drawText(ctx, amountUnit, amountX + amountWidth + (isNoteMode ? -1 : 1), coords.amountY, coords.unitSize, 'BangkokMoneyMedium', '#232121', 'left', 1.5, 3, 0, 0, 500, 0);
        
        // วาด QR
        drawText(ctx, `${QRCode}`, 238.9, 599.0, 33, 'SukhumvitSetSemiBold', '#4e4e4e', 'left', 1.5, 5, 0, 0, 500, 0);
        
        if (mainLogoImg) {
            ctx.drawImage(mainLogoImg, coords.logoMainX, coords.logoMainY, coords.logoMainSize, coords.logoMainSize);  
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
        link.download = 'slip_bbl.png';
        link.click();
    };

})();