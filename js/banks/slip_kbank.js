// js/banks/slip_kbank.js
// รวมระบบสร้างสลิปกสิกรไทย (KBANK) ทั้งโหมดปกติ และ โหมดบันทึกช่วยจำ (Note)

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

        return Promise.all(fonts.map(font => font.load().catch(e => {}))).then(function(loadedFonts) {
            loadedFonts.forEach(function(font) { if (font) document.fonts.add(font); });
        });
    }

    function ensureFontsLoaded() {
        if (fontsLoaded) return Promise.resolve();
        return loadFonts().then(() => { fontsLoaded = true; });
    }

    // ==========================================
    // 2. ฟังก์ชันเครื่องมือ (Helpers)
    // ==========================================
    function padZero(num) { return num.toString().padStart(2, '0'); }

    function formatDate(date) {
        if (!date) return '-';
        const d = new Date(date);
        if (isNaN(d.getTime())) return '-';
        const options = { day: 'numeric', month: 'short', year: '2-digit' };
        let formattedDate = d.toLocaleDateString('th-TH', options);
        formattedDate = formattedDate.replace(/ /g, ' ').replace(/\./g, '');
        const months = ['ม.ค.', 'ก.พ.', 'มี.ค.', 'เม.ย.', 'พ.ค.', 'มิ.ย.', 'ก.ค.', 'ส.ค.', 'ก.ย.', 'ต.ค.', 'พ.ย.', 'ธ.ค.'];
        const day = formattedDate.split(' ')[0];
        const month = months[d.getMonth()];
        const year = formattedDate.split(' ')[2];
        return `${day} ${month} ${year}`;
    }

    function generateUniqueID() {
        const dtEl = document.getElementById('datetime');
        const now = dtEl && dtEl.value ? new Date(dtEl.value) : new Date();
        const startDate = new Date("2024-07-24");
        const dayDifference = Math.floor((now - startDate) / (1000 * 60 * 60 * 24));
        const uniqueDay = (15475 + dayDifference).toString().padStart(6, '0');
        const timePart = `${padZero(now.getHours())}${padZero(now.getMinutes())}${padZero(now.getSeconds())}`;
        const randomPart = Math.floor(Math.random() * 10000).toString().padStart(4, '0');
        const bank = document.getElementById('bank') ? document.getElementById('bank').value : '';

        let prefix = "BOR";
        if (bank === "MetaAds") {
            const prefixes = ["APM", "BPM", "CPM", "DPM"];
            prefix = prefixes[Math.floor(Math.random() * prefixes.length)];
        } else if (bank === "รหัสพร้อมเพย์" || bank === "พร้อมเพย์วอลเล็ท") {
            const prefixes = ["APP", "BPP", "CPP", "DPP"];
            prefix = prefixes[Math.floor(Math.random() * prefixes.length)];
        } else if (bank === "ธ.กสิกรไทย") {
            const prefixes = ["ATF", "BTF", "CTF", "DTF"];
            prefix = prefixes[Math.floor(Math.random() * prefixes.length)];
        } else {
            const prefixes = ["AOR", "BOR", "COR", "DOR"];
            prefix = prefixes[Math.floor(Math.random() * prefixes.length)];
        }
        return `${uniqueDay}${timePart}${prefix}0${randomPart}`;
    }

    function getInputValue(id, fallback = '') {
        const el = document.getElementById(id);
        return el && el.value ? el.value : fallback;
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
        const chars = [...segmenter.segment(text)].map(seg => seg.segment);
        let currentX = x;
        chars.forEach((char, idx) => {
            ctx.fillText(char, currentX, y);
            currentX += ctx.measureText(char).width + letterSpacing;
        });
    }

    function drawText(ctx, text, x, y, fontSize, fontFamily, color, align, lineHeight, maxLines, shadowColor, shadowBlur, maxWidth, letterSpacing) {
        ctx.font = `${fontSize}px ${fontFamily}`;
        ctx.fillStyle = color;
        ctx.textAlign = 'left';
        ctx.shadowColor = shadowColor || 'transparent';
        ctx.shadowBlur  = shadowBlur || 0;

        const paragraphs = text.split('<br>');
        let currentY = y;
        const spacing = letterSpacing || 0;

        paragraphs.forEach(paragraph => {
            if (!paragraph) { currentY += lineHeight; return; }
            const words = paragraph.split(/(\s+)/);
            let line = '';
            const lines = [];

            words.forEach(word => {
                const testLine = line + word;
                const testWidth = computeTextWidth(ctx, testLine, spacing);

                if (maxWidth && maxWidth > 0 && testWidth > maxWidth && line) {
                    lines.push(line);
                    line = word.trimStart();
                } else {
                    line = testLine;
                }
            });
            if (line) lines.push(line);

            const limit = maxLines && maxLines > 0 ? maxLines : lines.length;

            for (let i = 0; i < lines.length && i < limit; i++) {
                const l = lines[i];
                let currentX = x;
                const lineWidth = computeTextWidth(ctx, l, spacing);

                if (align === 'center') {
                    currentX = x - lineWidth / 2;
                } else if (align === 'right') {
                    currentX = x - lineWidth;
                }

                drawTextLine(ctx, l, currentX, currentY, spacing);
                currentY += lineHeight;
            }
        });
    }

    function drawImage(ctx, imageUrl, x, y, width, height) {
        const image = new Image();
        image.src = imageUrl;
        image.onload = function() { ctx.drawImage(image, x, y, width, height); };
    }

    function getBankInfo(bank, isPromptPay, isMetaAds) {
        let bankText = bank;
        let bankLogoUrl = '';
        
        if (isPromptPay) bankText = '';
        else if (isMetaAds) bankText = '';

        switch (bank) {
            case 'ธ.กสิกรไทย':          bankText = 'ธ.กสิกรไทย'; bankLogoUrl = 'assets/image/logo/KBANK.png'; break;
            case 'ธ.กรุงไทย':           bankText = 'ธ.กรุงไทย'; bankLogoUrl = 'assets/image/logo/KTB.png'; break;
            case 'ธ.กรุงเทพ':           bankText = 'ธ.กรุงเทพ'; bankLogoUrl = 'assets/image/logo/BBL1.png'; break;
            case 'ธ.ไทยพาณิชย์':        bankText = 'ธ.ไทยพาณิชย์'; bankLogoUrl = 'assets/image/logo/SCB1.png'; break;
            case 'ธ.กรุงศรีอยุธยา':     bankText = 'ธ.กรุงศรีอยุธยา'; bankLogoUrl = 'assets/image/logo/BAY.png'; break;
            case 'ธ.ทหารไทยธนชาต':     bankText = 'ธ.ทหารไทยธนชาต'; bankLogoUrl = 'assets/image/logo/TTB1.png'; break;
            case 'ธ.ออมสิน':           bankText = 'ธ.ออมสิน'; bankLogoUrl = 'assets/image/logo/O.png'; break;
            case 'ธ.ก.ส.':             bankText = 'ธ.ก.ส.'; bankLogoUrl = 'assets/image/logo/T.png'; break;
            case 'ธ.อาคารสงเคราะห์':    bankText = 'ธ.อาคารสงเคราะห์'; bankLogoUrl = 'assets/image/logo/C.png'; break;
            case 'ธ.เกียรตินาคินภัทร':  bankText = 'ธ.เกียรตินาคินภัทร'; bankLogoUrl = 'assets/image/logo/K.png'; break;
            case 'ธ.ซีไอเอ็มบี':        bankText = 'ธ.ซีไอเอ็มบี'; bankLogoUrl = 'assets/image/logo/CIMB.png'; break;
            case 'ธ.ยูโอบี':            bankText = 'ธ.ยูโอบี'; bankLogoUrl = 'assets/image/logo/UOB.png'; break;
            case 'ธ.แลนด์ แอนด์ เฮ้าส์': bankText = 'ธ.แลนด์ แอนด์ เฮ้าส์'; bankLogoUrl = 'assets/image/logo/LHBANK.png'; break;
            case 'ธ.ไอซีบีซี':          bankText = 'ธ.ไอซีบีซี'; bankLogoUrl = 'assets/image/logo/ICBC.png'; break;
            case 'รหัสพร้อมเพย์':       bankText = 'รหัสพร้อมเพย์'; bankLogoUrl = 'assets/image/logo/P-KBANK.png'; break;
            case 'พร้อมเพย์วอลเล็ท':    bankLogoUrl = 'assets/image/logo/P-KBANK.png'; break;
            case 'MetaAds':             bankLogoUrl = 'assets/image/logo/Meta.png'; break;
        }

        return { bankText, bankLogoUrl };
    }

    // ==========================================
    // 3. ฟังก์ชันวาดโหมดปกติ (Standard)
    // ==========================================
    function renderSlipStandard() {
        const sendername = getInputValue('sendername', '-');
        const senderaccount = getInputValue('senderaccount', '-');
        const receivername = getInputValue('receivername', '-');
        const receiveraccount = getInputValue('receiveraccount', '-');
        const bank = getInputValue('bank', '-');
        const amount11 = getInputValue('amount11', '-');
        const datetime = getInputValue('datetime', '');
        const selectedImage = getInputValue('imageSelect', '');
        const QRCode = getInputValue('QRCode', '');
        const bgSelectEl = document.getElementById('backgroundSelect');
        let backgroundImageSrc = bgSelectEl ? bgSelectEl.value : 'assets/image/bs/N-K1.jpg';

        const isPromptPay = bank === 'พร้อมเพย์วอลเล็ท';
        const isMetaAds   = bank === 'MetaAds';

        const bankInfo = getBankInfo(bank, isPromptPay, isMetaAds);
        
        let receiveraccountPositionY = 697.7;
        let receivernamePositionY = 577.0;

        if (isPromptPay) {
            receiveraccountPositionY = 639.0;
            receivernamePositionY = 577.0;
        } else if (isMetaAds) {
            receiveraccountPositionY = 639.0;
            receivernamePositionY = 1300.0;
        }

        const formattedDate = formatDate(datetime);
        const d = new Date(datetime);
        const formattedTime = isNaN(d.getTime()) ? '' : d.toLocaleTimeString('th-TH', { hour: '2-digit', minute: '2-digit' });

        const canvas = document.getElementById('canvas');
        if (!canvas) return;
        const ctx = canvas.getContext('2d');

        const backgroundImage = new Image();
        backgroundImage.src = backgroundImageSrc;
        backgroundImage.onload = function () {
            ctx.clearRect(0, 0, canvas.width, canvas.height);
            ctx.drawImage(backgroundImage, 0, 0, canvas.width, canvas.height);

            const bankLogo = new Image();
            bankLogo.src = bankInfo.bankLogoUrl;
            bankLogo.onload = function() {
                ctx.drawImage(bankLogo, 34.6, 526.7, 157, 157); 
                
                drawText(ctx, `${formattedDate}  ${formattedTime} น.`, 68.9, 136.6, 37.5, 'kuriousRegular', '#4e4e4e', 'left', 1.5, 0, 0, 0, 800, 0);
                drawText(ctx, `${sendername}`, 238.9, 272.0, 39.3, 'kuriousSemiBold', '#4e4e4e', 'left', 1.5, 3, 0, 0, 800, 0);
                drawText(ctx, `ธ.กสิกรไทย`, 238.9, 333.6, 37.5, 'kuriousRegular', '#545454', 'left', 1.5, 2, 0, 0, 500, 0);
                drawText(ctx, `${senderaccount}`, 238.9, 392.5, 37.5, 'kuriousRegular', '#545454', 'left', 1.5, 1, 0, 0, 500, 0);
                
                drawText(ctx, `${receivername}`, 238.9, receivernamePositionY, 39.3, 'kuriousSemiBold', '#4e4e4e', 'left', 1.5, 3, 0, 0, 800, 0);
                drawText(ctx, bankInfo.bankText, 238.9, 639.0, 37.5, 'kuriousRegular', '#545454', 'left', 1.5, 2, 0, 0, 500, 0);
                drawText(ctx, `${receiveraccount}`, 238.9, receiveraccountPositionY, 37.5, 'kuriousRegular', '#545454', 'left', 1.5, 1, 0, 0, 500, 0);
                
                if (isMetaAds) {
                    drawText(ctx, `${receiveraccount}`, 238.9, 697.7, 37.5, 'kuriousRegular', '#545454', 'left', 1.5, 1, 0, 0, 500, 0);
                    drawText(ctx, `Meta Ads (KGP)`, 238.9, 577.00, 39.3, 'kuriousSemiBold', '#4e4e4e', 'left', 1.5, 3, 0, 0, 800, 0);
                }
                
                drawText(ctx, `${generateUniqueID()}`, 459, 885.4, 35.63, 'kuriousRegular', '#575757', 'right', 1.5, 3, 0, 0, 500, -2);
                drawText(ctx, `${amount11} บาท`, 459, 1003.6, 38.44, 'kuriousSemiBold', '#4b4b4b', 'right', 1.5, 3, 0, 0, 500, -2);
                drawText(ctx, `0.00 บาท`, 459, 1124.2, 38.44, 'kuriousSemiBold', '#4b4b4b', 'right', 1.5, 3, 0, 0, 500, -2);
                
                drawText(ctx, `${QRCode}`, 238.9, 599.0, 33, 'kuriousSemiBold', '#4e4e4e', 'left', 1.5, 5, 0, 0, 500, 0);
                drawImage(ctx, 'assets/image/logo/KBANK.png', 34.6, 222, 157, 157);  
            
                if (selectedImage && selectedImage !== 'assets/image/st/NO.png') {
                    const customImage = new Image();
                    customImage.src = selectedImage;
                    customImage.onload = function() {
                        ctx.drawImage(customImage, 0, 0, 842, 1200);
                    }
                }
            };
        };
    }

    // ==========================================
    // 4. ฟังก์ชันวาดโหมดบันทึกช่วยจำ (Note)
    // ==========================================
    function renderSlipNote() {
        const sendername      = getInputValue('sendername', '-');
        const senderaccount   = getInputValue('senderaccount', '-');
        const receivername    = getInputValue('receivername', '-');
        const receiveraccount = getInputValue('receiveraccount', '-');
        const bank            = getInputValue('bank', '-');
        const amount11        = getInputValue('amount11', '-');
        const datetime        = getInputValue('datetime', '');
        const selectedImage   = getInputValue('imageSelect', '');
        const QRCode          = getInputValue('QRCode', '');
        const AideMemoire     = getInputValue('AideMemoire', '-');

        const bgNoteEl    = document.getElementById('bg_note');
        const bgNoteValue = bgNoteEl ? bgNoteEl.value : 'assets/image/bs/N-K1T.jpg';

        const isPromptPay = bank === 'พร้อมเพย์วอลเล็ท';
        const isMetaAds   = bank === 'MetaAds';

        const bankInfo = getBankInfo(bank, isPromptPay, isMetaAds);

        let receiveraccountPositionY = 681.7;
        let receivernamePositionY    = 564.3;

        if (isPromptPay) {
            receiveraccountPositionY = 624.8;
            receivernamePositionY    = 564.3;
        } else if (isMetaAds) {
            receiveraccountPositionY = 624.8;
            receivernamePositionY    = 1300.0;
        }

        const formattedDate = formatDate(datetime);
        const d = new Date(datetime);
        const formattedTime = isNaN(d.getTime()) ? '' : d.toLocaleTimeString('th-TH', { hour: '2-digit', minute: '2-digit' });

        const canvas = document.getElementById('canvas');
        if (!canvas) return;
        const ctx = canvas.getContext('2d');

        const backgroundImage = new Image();
        backgroundImage.src = bgNoteValue;
        backgroundImage.onload = function() {
            ctx.clearRect(0, 0, canvas.width, canvas.height);
            ctx.drawImage(backgroundImage, 0, 0, canvas.width, canvas.height);

            const bankLogo = new Image();
            bankLogo.src = bankInfo.bankLogoUrl;
            bankLogo.onload = function() {
                ctx.drawImage(bankLogo, 34.2, 515.7, 154, 154);

                drawText(ctx, `${formattedDate}  ${formattedTime} น.`, 67.5, 133.1, 37.5, 'kuriousRegular', '#4e4e4e', 'left', 1.5, 3, 0, 0, 800, 0);

                drawText(ctx, `${sendername}`,      233.5, 265.8, 39.3, 'kuriousSemiBold', '#4e4e4e', 'left', 1.5, 3, 0, 0, 800, 0);
                drawText(ctx, `ธ.กสิกรไทย`,        233.5, 326.0, 37.5, 'kuriousRegular',  '#545454', 'left', 1.5, 2, 0, 0, 500, 0);
                drawText(ctx, `${senderaccount}`,   233.5, 384.0, 37.5, 'kuriousRegular',  '#545454', 'left', 1.5, 1, 0, 0, 500, 0);

                drawText(ctx, `${receivername}`,    233.5, receivernamePositionY, 39.3, 'kuriousSemiBold', '#4e4e4e', 'left', 1.5, 3, 0, 0, 800, 0);
                drawText(ctx, bankInfo.bankText,    233.5, 624.8,               37.5, 'kuriousRegular',  '#545454', 'left', 1.5, 2, 0, 0, 500, 0);
                drawText(ctx, `${receiveraccount}`, 233.5, receiveraccountPositionY, 37.5, 'kuriousRegular', '#545454', 'left', 1.5, 1, 0, 0, 500, 0);

                if (isMetaAds) {
                    drawText(ctx, `${receiveraccount}`,    233.5, 681.7, 37.5, 'kuriousRegular', '#545454', 'left', 1.5, 1, 0, 0, 500, 0);
                    drawText(ctx, `Meta Ads (KGP)`,       233.5, 564.3, 39.3, 'kuriousSemiBold', '#4e4e4e', 'left', 1.5, 3, 0, 0, 800, 0);
                }

                drawText(ctx, `${generateUniqueID()}`, 449,  865.2, 34.63, 'kuriousRegular',  '#575757', 'right', 1.5, 3, 0, 0, 500, -2);
                drawText(ctx, `${amount11} บาท`,     449,  980.9, 38.44, 'kuriousSemiBold', '#4b4b4b', 'right', 1.5, 3, 0, 0, 500, -2);
                drawText(ctx, `0.00 บาท`,           449, 1098.6, 38.44, 'kuriousSemiBold', '#4b4b4b', 'right', 1.5, 3, 0, 0, 500, -2);

                drawText(ctx, `${QRCode}`,     238.9, 599.0, 33,    'kuriousSemiBold', '#4e4e4e', 'left', 1.5, 5, 0, 0, 500, 0);
                drawImage(ctx, 'assets/image/logo/KBANK.png', 34.2, 217.5, 154, 154);

                drawText(ctx, `${AideMemoire}`, 208.3, 1173.1, 30.23, 'kuriousRegular', '#545454', 'left', 1.5, 1, 0, 0, 500, 0);

                if (selectedImage && selectedImage !== 'assets/image/st/NO.png') {
                    const customImage = new Image();
                    customImage.src = selectedImage;
                    customImage.onload = function() {
                        ctx.drawImage(customImage, 0, 0, 823, 1200);
                    };
                }
            };
        };
    }

    // ==========================================
    // 5. EXPORT ให้ HTML เรียกใช้งาน
    // ==========================================
    window.updateDisplayStandard = function() {
        ensureFontsLoaded().then(() => { renderSlipStandard(); }).catch(() => { renderSlipStandard(); });
    };

    window.updateDisplayNote = function() {
        ensureFontsLoaded().then(() => { renderSlipNote(); }).catch(() => { renderSlipNote(); });
    };

    window.downloadImage = function() {
        const canvas = document.getElementById('canvas');
        if (!canvas) return;
        const link = document.createElement('a');
        link.href = canvas.toDataURL('image/png');
        link.download = 'slip_kbank.png';
        link.click();
    };

})();