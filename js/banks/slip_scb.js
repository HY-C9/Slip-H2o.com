// js/banks/slip_scb.js
// รวมระบบสร้างสลิปไทยพาณิชย์ (SCB) ทั้งโหมดปกติ และ โหมดบันทึกช่วยจำ (Note)

(function() {
    const fontPath = 'assets/fonts';
    let fontsLoaded = false;

    // ==========================================
    // 1. ระบบโหลดฟอนต์ทั้งหมด
    // ==========================================
    async function loadFonts() {
        const fonts = [
            new FontFace('SukhumvitSetThin', `url(${fontPath}/SukhumvitSet-Thin.woff)`),
            new FontFace('SukhumvitSetText', `url(${fontPath}/SukhumvitSet-Text.woff)`),
            new FontFace('SukhumvitSetLight', `url(${fontPath}/SukhumvitSet-Light.woff)`),
            new FontFace('SukhumvitSetMedium', `url(${fontPath}/SukhumvitSet-Medium.woff)`),
            new FontFace('SukhumvitSetSemiBold', `url(${fontPath}/SukhumvitSet-SemiBold.woff)`),
            new FontFace('SukhumvitSetBold', `url(${fontPath}/SukhumvitSet-Bold.woff)`),
            new FontFace('SukhumvitSetExtraBold', `url(${fontPath}/SukhumvitSet-Extra%20Bold.woff)`),
            new FontFace('SFThonburiLight', `url(${fontPath}/SFThonburi.woff)`),
            new FontFace('SFThonburiRegular', `url(${fontPath}/SFThonburi-Regular.woff)`),
            new FontFace('SFThonburiSemiBold', `url(${fontPath}/SFThonburi-Semibold.woff)`),
            new FontFace('SFThonburiBold', `url(${fontPath}/SFThonburi-Bold.woff)`),
            new FontFace('KanitThin', `url(${fontPath}/Kanit-Thin.woff)`),
            new FontFace('KanitExtraLight', `url(${fontPath}/Kanit-ExtraLight.woff)`),
            new FontFace('KanitLight', `url(${fontPath}/Kanit-Light.woff)`),
            new FontFace('KanitRegular', `url(${fontPath}/Kanit-Regular.woff)`),
            new FontFace('KanitMedium', `url(${fontPath}/Kanit-Medium.woff)`),
            new FontFace('KanitSemiBold', `url(${fontPath}/Kanit-SemiBold.woff)`),
            new FontFace('KanitBold', `url(${fontPath}/Kanit-Bold.woff)`),
            new FontFace('KanitExtraBold', `url(${fontPath}/Kanit-ExtraBold.woff)`),
            new FontFace('KanitBlack', `url(${fontPath}/Kanit-Black.woff)`),
            new FontFace('BangkokTime1', `url(${fontPath}/Bangkok-Time1.woff)`),
            new FontFace('BangkokTime2', `url(${fontPath}/Bangkok-Time2.woff)`),
            new FontFace('BangkokMoney', `url(${fontPath}/Bangkok-Money.woff)`),
            new FontFace('BangkokTime', `url(${fontPath}/Bangkok-Time.woff)`),
            new FontFace('BangkokMoneyRegular', `url(${fontPath}/Bangkok-Money-Regular.woff)`),
            new FontFace('BangkokMoneyMedium', `url(${fontPath}/Bangkok-Money-Medium.woff)`),
            new FontFace('BangkokMoneySemiBold', `url(${fontPath}/Bangkok-Money-SemiBold.woff)`),
            new FontFace('BangkokMoneyBold', `url(${fontPath}/Bangkok-Money-Bold.woff)`),
            new FontFace('TTBMoneyRegular', `url(${fontPath}/TTB-Money-Regular.woff)`),
            new FontFace('TTBMoneyMedium', `url(${fontPath}/TTB-Money-Medium.woff)`),
            new FontFace('TTBMoneySemiBold', `url(${fontPath}/TTB-Money-SemiBold.woff)`),
            new FontFace('TTBMoneyBold', `url(${fontPath}/TTB-Money-Bold.woff)`),
            new FontFace('TTBMoneyExtraBold', `url(${fontPath}/TTB-Money-ExtraBold.woff)`),
            new FontFace('krungsriRegular', `url(${fontPath}/krungsri_con-webfont.woff)`),
            new FontFace('krungsriMedium', `url(${fontPath}/krungsri_con_med-webfont.woff)`),
            new FontFace('krungsriBold', `url(${fontPath}/krungsri_con_bol-webfont.woff)`),
            new FontFace('THSarabunRegular', `url(${fontPath}/THSarabun.woff)`),
            new FontFace('THSarabunBold', `url(${fontPath}/THSarabun-Bold.woff)`),
            new FontFace('THSarabunItalic', `url(${fontPath}/THSarabun-Italic.woff)`),
            new FontFace('THSarabunBoldItalic', `url(${fontPath}/THSarabun-BoldItalic.woff)`),
            new FontFace('THSarabunNew', `url(${fontPath}/THSarabunNew.woff)`),
            new FontFace('THSarabunNewBold', `url(${fontPath}/THSarabunNew-Bold.woff)`),
            new FontFace('THSarabunNewItalic', `url(${fontPath}/THSarabunNew-Italic.woff)`),
            new FontFace('THSarabunNewBoldItalic', `url(${fontPath}/THSarabunNew-BoldItalic.woff)`),
            new FontFace('DBHelvethaicaMonX', `url(${fontPath}/DBHelvethaicaMonX.woff)`),
            new FontFace('DBHelvethaicaMonXCond', `url(${fontPath}/DBHelvethaicaMonXCond.woff)`),
            new FontFace('DBHelvethaicaMonXMed', `url(${fontPath}/DBHelvethaicaMonXMed.woff)`),
            new FontFace('DBHelvethaicaMonXMedCond', `url(${fontPath}/DBHelvethaicaMonXMedCond.woff)`),
            new FontFace('DBHelvethaicaMonXBold', `url(${fontPath}/DBHelvethaicaMonXBd.woff)`),
            new FontFace('DBHelvethaicaMonXBoldCond', `url(${fontPath}/DBHelvethaicaMonXBdCond.woff)`),
            new FontFace('DBHelvethaicaMonXBlk', `url(${fontPath}/DBHelvethaicaMonXBlk.woff)`),
            new FontFace('DXKrungthaiSemiBold', `url(${fontPath}/DX-Krungthai-SemiBold.woff)`),
            new FontFace('DXKrungthaiThin', `url(${fontPath}/DX-Krungthai-Thin.woff)`),
            new FontFace('DXSCB', `url(${fontPath}/DX-SCB.woff)`),
            new FontFace('DXTTBBold', `url(${fontPath}/DX-TTB-bold.woff)`),
            new FontFace('DXTTBRegular', `url(${fontPath}/DX-TTB-regular.woff)`),
            new FontFace('DXKrungthaiBold', `url(${fontPath}/DX-Krungthai-Bold.woff)`),
            new FontFace('DXKrungthaiMedium', `url(${fontPath}/DX-Krungthai-Medium.woff)`),
            new FontFace('DXKrungthaiRegular', `url(${fontPath}/DX-Krungthai-Regular.woff)`),
            new FontFace('TTBMoney', `url(${fontPath}/TTB Money.woff)`),
            new FontFace('CoreSansLight', `url(${fontPath}/Core-Sans-E-W01-35-Light.woff)`),
            new FontFace('CoreSansBold', `url(${fontPath}/Core-Sans-N-65-Bold.woff)`),
            new FontFace('kuriousRegular', `url(${fontPath}/kurious-Regular.woff)`),
            new FontFace('kuriousSemiBold', `url(${fontPath}/kurious-semibold.woff)`)
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
    function padZero(num) { return num < 10 ? '0' + num : num; }

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
        const now = new Date();
        const year = now.getFullYear();
        const month = String(now.getMonth() + 1).padStart(2, '0');
        const day = String(now.getDate()).padStart(2, '0');
        const randomNumber = Math.floor(Math.random() * 10);
        const characters = 'abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ';
        let randomString = '';
        for (let i = 0; i < 16; i++) {
            if (Math.random() < 0.05) randomString += Math.floor(Math.random() * 10);
            else randomString += characters.charAt(Math.floor(Math.random() * characters.length));
        }
        return `${year}${month}${day}${randomNumber}${randomString}`;
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

    function computeTextWidth(ctx, text, letterSpacing) {
        if (!letterSpacing) return ctx.measureText(text).width;
        const segmenter = new Intl.Segmenter('th', { granularity: 'grapheme' });
        const chars = [...segmenter.segment(text)].map(seg => seg.segment);
        let w = 0;
        chars.forEach((ch, idx) => {
            w += ctx.measureText(ch).width;
            if (idx < chars.length - 1) w += letterSpacing;
        });
        return w;
    }

    function drawTextLine(ctx, text, x, y, letterSpacing) {
        if (!letterSpacing) {
            ctx.fillText(text, x, y);
            return;
        }
        const segmenter = new Intl.Segmenter('th', { granularity: 'grapheme' });
        const characters = [...segmenter.segment(text)].map(segment => segment.segment);
        let currentPosition = x;

        characters.forEach((char, index) => {
            ctx.fillText(char, currentPosition, y);
            const charWidth = ctx.measureText(char).width;
            currentPosition += charWidth + letterSpacing;
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

                if (maxWidth && testWidth > maxWidth && currentLine !== '') {
                    lines.push(currentLine);
                    currentLine = word;
                } else {
                    currentLine = testLine;
                }
            });
            if (currentLine) {
                lines.push(currentLine);
            }

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
            currentY += lineHeight;
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
        const datetime = getInputValue('datetime', '-');
        const QRCode = getInputValue('QRCode', '');
        
        const noteToggleElem = document.getElementById('modeSwitch');
        const isNoteMode = noteToggleElem ? noteToggleElem.checked : false;
        const AideMemoire = getInputValue('AideMemoire', '-');

        const selectedImage = getInputValue('imageSelect', '');
        const backgroundSelect = getInputValue('backgroundSelect', '');

        let bankLogoUrl = '';
        switch (bank) {
            case 'กสิกรไทย': bankLogoUrl = 'assets/image/logo/A-KBANK.png'; break;
            case 'กรุงไทย': bankLogoUrl = 'assets/image/logo/A-KTB.png'; break;
            case 'กรุงเทพ': bankLogoUrl = 'assets/image/logo/A-BBL.png'; break;
            case 'ไทยพาณิชย์': bankLogoUrl = 'assets/image/logo/A-SCB.png'; break;
            case 'กรุงศรี': bankLogoUrl = 'assets/image/logo/A-BAY.png'; break;
            case 'ทีเอ็มบีธนชาต': bankLogoUrl = 'assets/image/logo/A-TTB.png'; break;
            case 'ออมสิน': bankLogoUrl = 'assets/image/logo/A-O.png'; break;
            case 'ธ.ก.ส.': bankLogoUrl = 'assets/image/logo/A-T.png'; break;
            case 'อาคารสงเคราะห์': bankLogoUrl = 'assets/image/logo/A-C.png'; break;
            case 'เกียรตินาคินภัทร': bankLogoUrl = 'assets/image/logo/A-K.png'; break;
            case 'ซีไอเอ็มบีไทย': bankLogoUrl = 'assets/image/logo/A-CIMB.png'; break;
            case 'ยูโอบี': bankLogoUrl = 'assets/image/logo/A-UOB2.png'; break;
            case 'แลนด์ แอนด์ เฮาส์': bankLogoUrl = 'assets/image/logo/A-LHBANK.png'; break;
            case 'ไอซีบีซี': bankLogoUrl = 'assets/image/logo/A-ICBC.png'; break;
            case 'พร้อมเพย์เบอร์': bankLogoUrl = 'assets/image/logo/P-SCB.png'; break;
            case 'พร้อมเพย์บัตรประชาชน': bankLogoUrl = 'assets/image/logo/P-SCB1.1.png'; break;
            case 'พร้อมเพย์ e-Wallet TrueMoney': bankLogoUrl = 'assets/image/logo/P-SCB2.png'; break;
            case 'พร้อมเพย์ e-Wallet Jaew': bankLogoUrl = 'assets/image/logo/P-SCB2.png'; break;
            case 'พร้อมเพย์ e-Wallet K Plus W': bankLogoUrl = 'assets/image/logo/P-SCB2.png'; break;
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
        
        const senderNameFont = isNoteMode ? '42.3px DBHelvethaicaMonXMed' : '44.3px DBHelvethaicaMonXMed';
        ctx.font = senderNameFont;
        
        const senderNameWidth = ctx.measureText(sendername).width;
        const senderImageWidth = 55;
        const senderSpacing = 10;
        const senderTotalWidth = senderImageWidth + senderSpacing + senderNameWidth;
        
        const alignRightEdge = isNoteMode ? 698 : 769; 
        const senderStartX = alignRightEdge - senderTotalWidth;
        
        const senderImageX = senderStartX;
        const senderNameX = senderImageX + senderImageWidth + senderSpacing;
        
        const receiverNameWidth = ctx.measureText(receivername).width;
        const bankLogoWidth = 55;
        const receiverSpacing = 10;
        const receiverTotalWidth = bankLogoWidth + receiverSpacing + receiverNameWidth;
        
        const receiverStartX = alignRightEdge - receiverTotalWidth;
        const bankLogoX = receiverStartX;
        const receiverNameX = bankLogoX + bankLogoWidth + receiverSpacing;

        let backgroundImageSrc = backgroundSelect || 'assets/image/bs/SCB1.jpg';

        if (isNoteMode) {
            const bgNoteElem = document.getElementById('bg_note');
            if(bgNoteElem && bgNoteElem.value) {
                backgroundImageSrc = bgNoteElem.value;
            }
            backgroundImageSrc = backgroundImageSrc.replace('.jpt', '.jpg');
            if (!backgroundImageSrc.includes('T.jpg')) {
                backgroundImageSrc = backgroundImageSrc.replace('.jpg', 'T.jpg');
            }
        } else {
            backgroundImageSrc = backgroundImageSrc.replace('.jpt', '.jpg');
        }

        let originalBgSrc = backgroundImageSrc; 

        if (isNoteMode) {
            if (bank === 'พร้อมเพย์ e-Wallet TrueMoney' || bank === 'พร้อมเพย์ e-Wallet Jaew' || bank === 'พร้อมเพย์ e-Wallet K Plus W') {
                canvas.width = 743; canvas.height = 1399;
                backgroundImageSrc = backgroundImageSrc.replace('/SCB', '/SCBB'); 
            } else if (bank === 'MetaAds') {
                canvas.width = 743; canvas.height = 1349;
                backgroundImageSrc = backgroundImageSrc.replace('/SCB', '/SSCB'); 
            } else {
                canvas.width = 743; canvas.height = 1280;
            }
        } else {
            if (bank === 'พร้อมเพย์ e-Wallet TrueMoney' || bank === 'พร้อมเพย์ e-Wallet Jaew' || bank === 'พร้อมเพย์ e-Wallet K Plus W') {
                canvas.width = 818; canvas.height = 1413;
                backgroundImageSrc = backgroundImageSrc.replace('/SCB', '/SCBB'); 
            } else if (bank === 'MetaAds') {
                canvas.width = 818; canvas.height = 1356;
                backgroundImageSrc = backgroundImageSrc.replace('/SCB', '/SSCB'); 
            } else {
                canvas.width = 818; canvas.height = 1280;
            }
        }

        let bgImg = await loadImage(backgroundImageSrc);
        let pathErrorLog = backgroundImageSrc;

        if (!bgImg && backgroundImageSrc !== originalBgSrc) {
            bgImg = await loadImage(originalBgSrc);
            pathErrorLog = originalBgSrc; 
        }

        const [bankLogoImg, senderLogoImg, ppLogoImg, metaLogoImg, stickerImg] = await Promise.all([
            loadImage(bankLogoUrl),
            loadImage('assets/image/logo/A-SCB.png'),
            loadImage('assets/image/logo/P-SCB1.png'),
            loadImage('assets/image/logo/Meta3.png'),
            loadImage((selectedImage && !selectedImage.includes('NO.png')) ? selectedImage : null)
        ]);

        if (bgImg) {
            ctx.clearRect(0, 0, canvas.width, canvas.height);
            ctx.drawImage(bgImg, 0, 0, canvas.width, canvas.height);
        } else {
            ctx.fillStyle = '#1e293b'; ctx.fillRect(0, 0, canvas.width, canvas.height);
            ctx.fillStyle = '#ff4d4f'; ctx.font = '30px Kanit, sans-serif';
            ctx.fillText('❌ หาไฟล์พื้นหลังนี้ไม่เจอ!', 50, canvas.height / 2 - 40);
            ctx.fillStyle = '#ffffff'; ctx.font = '22px Kanit, sans-serif';
            ctx.fillText('Path: ' + pathErrorLog, 50, canvas.height / 2);
        }

        if (isNoteMode) {
            if(senderLogoImg) ctx.drawImage(senderLogoImg, senderImageX, 408, senderImageWidth, 55);
            drawText(ctx, `${sendername}`, senderNameX, 443.8, 42.3, 'DBHelvethaicaMonXMed', '#47424e', 'left', 1.5, 3, 0, 0, 1500, 0);
            drawText(ctx, `${senderaccount}`, 698, 488.4, 35.0, 'DXSCB', '#76737b', 'right', 1.5, 1, 0, 0, 500, 0);
            drawText(ctx, `${formattedDate} - ${formattedTime}`, 370, 301.9, 35.0, 'DXSCB', '#76737b', 'center', 1.5, 3, 0, 0, 800, 0);

            if (bank === 'พร้อมเพย์ e-Wallet TrueMoney') {
                if(bankLogoImg) ctx.drawImage(bankLogoImg, bankLogoX, 520.7, bankLogoWidth, 55);
                if(ppLogoImg) ctx.drawImage(ppLogoImg, 424.5, 520.7, 55, 55);
                drawText(ctx, `เติมเงินพร้อมเพย์`, 490, 557.0, 42.3, 'DBHelvethaicaMonXMed', '#47424e', 'left', 1.5, 3, 0, 0, 1500, 0);
                drawText(ctx, `${receiveraccount}`, 698, 602.3, 35.0, 'DXSCB', '#76737b', 'right', 1.5, 1, 0, 0, 500, 0);
                drawText(ctx, `${receivername} (TrueMoney)`, 42.3, 836.4, 32.5, 'DXSCB', '#76737b', 'left', 1.5, 3, 0, 0, 800, 0);
                drawText(ctx, `${AideMemoire}`, 42.3, 953, 32.5, 'DXSCB', '#76737b', 'left', 1.5, 3, 0, 0, 800, 0);
                drawText(ctx, `${amount11}`, 698, 717.2, 42.3, 'DBHelvethaicaMonXMed', '#47424e', 'right', 1.5, 3, 0, 0, 500, 0);
                drawText(ctx, `รหัสอ้างอิง: ${generateUniqueID()}`, 370, 342.8, 35.0, 'DXSCB', '#76737b', 'center', 1.5, 1, 0, 0, 800, 0);
            
            } else if (bank === 'พร้อมเพย์ e-Wallet Jaew') {
                if(bankLogoImg) ctx.drawImage(bankLogoImg, bankLogoX, 520.7, bankLogoWidth, 55);
                if(ppLogoImg) ctx.drawImage(ppLogoImg, 424.5, 520.7, 55, 55);
                drawText(ctx, `เติมเงินพร้อมเพย์`, 490, 557.0, 42.3, 'DBHelvethaicaMonXMed', '#47424e', 'left', 1.5, 3, 0, 0, 1500, 0);
                drawText(ctx, `${receiveraccount}`, 698, 602.3, 35.0, 'DXSCB', '#76737b', 'right', 1.5, 1, 0, 0, 500, 0);
                drawText(ctx, `${receivername} (Jaew)`, 42.3, 836.4, 32.5, 'DXSCB', '#76737b', 'left', 1.5, 3, 0, 0, 800, 0);
                drawText(ctx, `${AideMemoire}`, 42.3, 953, 32.5, 'DXSCB', '#76737b', 'left', 1.5, 3, 0, 0, 800, 0);
                drawText(ctx, `${amount11}`, 698, 717.2, 42.3, 'DBHelvethaicaMonXMed', '#47424e', 'right', 1.5, 3, 0, 0, 500, 0);
                drawText(ctx, `รหัสอ้างอิง: ${generateUniqueID()}`, 370, 342.8, 35.0, 'DXSCB', '#76737b', 'center', 1.5, 1, 0, 0, 800, 0);

            } else if (bank === 'พร้อมเพย์ e-Wallet K Plus W') {
                if(bankLogoImg) ctx.drawImage(bankLogoImg, bankLogoX, 520.7, bankLogoWidth, 55);
                if(ppLogoImg) ctx.drawImage(ppLogoImg, 424.5, 520.7, 55, 55);
                drawText(ctx, `เติมเงินพร้อมเพย์`, 490, 557.0, 42.3, 'DBHelvethaicaMonXMed', '#47424e', 'left', 1.5, 3, 0, 0, 1500, 0);
                drawText(ctx, `${receiveraccount}`, 698, 602.3, 35.0, 'DXSCB', '#76737b', 'right', 1.5, 1, 0, 0, 500, 0);
                drawText(ctx, `${receivername} (K Plus W)`, 42.3, 836.4, 32.5, 'DXSCB', '#76737b', 'left', 1.5, 3, 0, 0, 800, 0);
                drawText(ctx, `${AideMemoire}`, 42.3, 953, 32.5, 'DXSCB', '#76737b', 'left', 1.5, 3, 0, 0, 800, 0);
                drawText(ctx, `${amount11}`, 698, 717.2, 42.3, 'DBHelvethaicaMonXMed', '#47424e', 'right', 1.5, 3, 0, 0, 500, 0);
                drawText(ctx, `รหัสอ้างอิง: ${generateUniqueID()}`, 370, 342.8, 35.0, 'DXSCB', '#76737b', 'center', 1.5, 1, 0, 0, 800, 0);
            
            } else if (bank === 'MetaAds') {
                if(metaLogoImg) ctx.drawImage(metaLogoImg, 406, 520.7, 53, 53);
                drawText(ctx, `META ADS (KGP)`, 471, 557.0, 42.3, 'DBHelvethaicaMonXMed', '#47424e', 'left', 1.5, 3, 0, 0, 1500, 0);
                drawText(ctx, `Biller ID : ${receivername}`, 698, 602.3, 35.0, 'DXSCB', '#76737b', 'right', 1.5, 1, 0, 0, 500, 0);
                drawText(ctx, `หมายเลขอ้างอิง 1 : ${receiveraccount}`, 698, 640, 35.5, 'DXSCB', '#76737b', 'right', 1.5, 1, 0, 0, 500, 0);
                drawText(ctx, `หมายเลขอ้างอิง 2 : ${receiveraccount}`, 698, 674, 35.5, 'DXSCB', '#76737b', 'right', 1.5, 1, 0, 0, 500, 0);
                drawText(ctx, `${AideMemoire}`, 42.3, 903, 32.5, 'DXSCB', '#76737b', 'left', 1.5, 3, 0, 0, 800, 0);
                drawText(ctx, `${amount11}`, 698, 785.5, 42.3, 'DBHelvethaicaMonXMed', '#47424e', 'right', 1.5, 3, 0, 0, 500, 0);
                drawText(ctx, `รหัสอ้างอิง: ${generateUniqueID()}`, 370, 342.8, 35.0, 'DXSCB', '#76737b', 'center', 1.5, 1, 0, 0, 800, 0);
            
            } else {
                if(bankLogoImg) ctx.drawImage(bankLogoImg, bankLogoX, 520.7, bankLogoWidth, 55);
                drawText(ctx, `${receivername}`, receiverNameX, 557.3, 42.3, 'DBHelvethaicaMonXMed', '#47424e', 'left', 1.5, 3, 0, 0, 1500, 0);
                drawText(ctx, `${receiveraccount}`, 698, 602.3, 35.0, 'DXSCB', '#76737b', 'right', 1.5, 1, 0, 0, 500, 0);
                drawText(ctx, `${AideMemoire}`, 42.3, 836.4, 32.5, 'DXSCB', '#76737b', 'left', 1.5, 3, 0, 0, 500, 0);
                drawText(ctx, `${amount11}`, 698, 717.2, 42.3, 'DBHelvethaicaMonXMed', '#47424e', 'right', 1.5, 3, 0, 0, 500, 0);
                drawText(ctx, `รหัสอ้างอิง: ${generateUniqueID()}`, 370, 342.8, 35.0, 'DXSCB', '#76737b', 'center', 1.5, 1, 0, 0, 800, 0);
            }

        } else {
            // โหมดปกติ (Standard Mode)
            if(senderLogoImg) ctx.drawImage(senderLogoImg, senderImageX, 449, senderImageWidth, 55);
            drawText(ctx, `${sendername}`, senderNameX, 488.4, 44.3, 'DBHelvethaicaMonXMed', '#47424e', 'left', 1.5, 3, 0, 0, 1500, 0);
            drawText(ctx, `${senderaccount}`, 769, 538, 38.5, 'DXSCB', '#76737b', 'right', 1.5, 1, 0, 0, 500, 0);
            drawText(ctx, `${formattedDate} - ${formattedTime}`, 407, 332.4, 38.5, 'DXSCB', '#76737b', 'center', 1.5, 3, 0, 0, 800, 0);

            if (bank === 'พร้อมเพย์ e-Wallet TrueMoney') {
                if(bankLogoImg) ctx.drawImage(bankLogoImg, bankLogoX, 573.7, bankLogoWidth, 55);
                if(ppLogoImg) ctx.drawImage(ppLogoImg, 486, 573.7, 55, 55);
                drawText(ctx, `เติมเงินพร้อมเพย์`, 551, 613.0, 44.3, 'DBHelvethaicaMonXMed', '#47424e', 'left', 1.5, 3, 0, 0, 1500, 0);
                drawText(ctx, `${receiveraccount}`, 769, 662.4, 38.5, 'DXSCB', '#76737b', 'right', 1.5, 1, 0, 0, 500, 0);
                drawText(ctx, `${receivername} (TrueMoney)`, 47, 924.5, 35.5, 'DXSCB', '#76737b', 'left', 1.5, 3, 0, 0, 800, 0);
                drawText(ctx, `${amount11}`, 769, 791.0, 44.3, 'DBHelvethaicaMonXMed', '#47424e', 'right', 1.5, 3, 0, 0, 500, 0);
                drawText(ctx, `รหัสอ้างอิง: ${generateUniqueID()}`, 407, 377.5, 38.5, 'DXSCB', '#76737b', 'center', 1.5, 1, 0, 0, 800, 0);
            
            } else if (bank === 'พร้อมเพย์ e-Wallet Jaew') {
                if(bankLogoImg) ctx.drawImage(bankLogoImg, bankLogoX, 573.7, bankLogoWidth, 55);
                if(ppLogoImg) ctx.drawImage(ppLogoImg, 486, 573.7, 55, 55);
                drawText(ctx, `เติมเงินพร้อมเพย์`, 551, 613.0, 44.3, 'DBHelvethaicaMonXMed', '#47424e', 'left', 1.5, 3, 0, 0, 1500, 0);
                drawText(ctx, `${receiveraccount}`, 769, 662.4, 38.5, 'DXSCB', '#76737b', 'right', 1.5, 1, 0, 0, 500, 0);
                drawText(ctx, `${receivername} (Jaew)`, 47, 924.5, 35.5, 'DXSCB', '#76737b', 'left', 1.5, 3, 0, 0, 800, 0);
                drawText(ctx, `${amount11}`, 769, 791.0, 44.3, 'DBHelvethaicaMonXMed', '#47424e', 'right', 1.5, 3, 0, 0, 500, 0);
                drawText(ctx, `รหัสอ้างอิง: ${generateUniqueID()}`, 407, 377.5, 38.5, 'DXSCB', '#76737b', 'center', 1.5, 1, 0, 0, 800, 0);

            } else if (bank === 'พร้อมเพย์ e-Wallet K Plus W') {
                if(bankLogoImg) ctx.drawImage(bankLogoImg, bankLogoX, 573.7, bankLogoWidth, 55);
                if(ppLogoImg) ctx.drawImage(ppLogoImg, 486, 573.7, 55, 55);
                drawText(ctx, `เติมเงินพร้อมเพย์`, 551, 613.0, 44.3, 'DBHelvethaicaMonXMed', '#47424e', 'left', 1.5, 3, 0, 0, 1500, 0);
                drawText(ctx, `${receiveraccount}`, 769, 662.4, 38.5, 'DXSCB', '#76737b', 'right', 1.5, 1, 0, 0, 500, 0);
                drawText(ctx, `${receivername} (K Plus W)`, 47, 924.5, 35.5, 'DXSCB', '#76737b', 'left', 1.5, 3, 0, 0, 800, 0);
                drawText(ctx, `${amount11}`, 769, 791.0, 44.3, 'DBHelvethaicaMonXMed', '#47424e', 'right', 1.5, 3, 0, 0, 500, 0);
                drawText(ctx, `รหัสอ้างอิง: ${generateUniqueID()}`, 407, 377.5, 38.5, 'DXSCB', '#76737b', 'center', 1.5, 1, 0, 0, 800, 0);

            } else if (bank === 'MetaAds') {
                if(metaLogoImg) ctx.drawImage(metaLogoImg, 464, 573.7, 53, 53);
                drawText(ctx, `META ADS (KGP)`, 530, 613.0, 44.3, 'DBHelvethaicaMonXMed', '#47424e', 'left', 1.5, 3, 0, 0, 1500, 0);
                drawText(ctx, `Biller ID : ${receivername}`, 769, 662.4, 38.5, 'DXSCB', '#76737b', 'right', 1.5, 1, 0, 0, 800, 0);
                drawText(ctx, `หมายเลขอ้างอิง 1 : ${receiveraccount}`, 769, 703, 39, 'DXSCB', '#76737b', 'right', 1.5, 1, 0, 0, 800, 0);
                drawText(ctx, `หมายเลขอ้างอิง 2 : ${receiveraccount}`, 769, 740, 39, 'DXSCB', '#76737b', 'right', 1.5, 1, 0, 0, 800, 0);
                drawText(ctx, `${amount11}`, 769, 865.0, 44.3, 'DBHelvethaicaMonXMed', '#47424e', 'right', 1.5, 3, 0, 0, 500, 0);
                drawText(ctx, `รหัสอ้างอิง: ${generateUniqueID()}`, 407, 377.5, 38.5, 'DXSCB', '#76737b', 'center', 1.5, 1, 0, 0, 800, 0);
            
            } else {
                if(bankLogoImg) ctx.drawImage(bankLogoImg, bankLogoX, 573.7, bankLogoWidth, 55);
                drawText(ctx, `${receivername}`, receiverNameX, 613.0, 44.3, 'DBHelvethaicaMonXMed', '#47424e', 'left', 1.5, 3, 0, 0, 1500, 0);
                drawText(ctx, `${receiveraccount}`, 769, 662.4, 38.5, 'DXSCB', '#76737b', 'right', 1.5, 1, 0, 0, 500, 0);
                drawText(ctx, `${amount11}`, 769, 791.0, 44.3, 'DBHelvethaicaMonXMed', '#47424e', 'right', 1.5, 3, 0, 0, 500, 0);
                drawText(ctx, `รหัสอ้างอิง: ${generateUniqueID()}`, 407, 377.5, 38.5, 'DXSCB', '#76737b', 'center', 1.5, 1, 0, 0, 800, 0);
            }
        }

        if (stickerImg) {
            ctx.drawImage(stickerImg, 0, 0, canvas.width, canvas.height);
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
        link.download = 'slip_scb.png';
        link.click();
    };

})();