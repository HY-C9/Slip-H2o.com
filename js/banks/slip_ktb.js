// js/banks/slip_ktb.js
// รวมระบบสร้างสลิปกรุงไทย (KTB) ทั้งโหมดปกติ และ โหมดบันทึกช่วยจำ (Note)

(function() {
    const fontPath = 'assets/fonts';
    let fontsLoaded = false;

    // ==========================================
    // 1. ระบบโหลดฟอนต์ทั้งหมด
    // ==========================================
    async function loadFonts() {
        const fonts = [
            new FontFace('DXKrungthaiBold', `url(${fontPath}/DX-Krungthai-Bold.woff)`),
            new FontFace('DXKrungthaiMedium', `url(${fontPath}/DX-Krungthai-Medium.woff)`),
            new FontFace('DXKrungthaiRegular', `url(${fontPath}/DX-Krungthai-Regular.woff)`),
            new FontFace('DXKrungthaiSemiBold', `url(${fontPath}/DX-Krungthai-SemiBold.woff)`),
            new FontFace('DXKrungthaiThin', `url(${fontPath}/DX-Krungthai-Thin.woff)`)
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
        const randomString = Array.from({ length: 16 }, () => Math.floor(Math.random() * 16).toString(16)).join('');
        return `A${randomString}`;
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
        try {
            const segmenter = new Intl.Segmenter('th', { granularity: 'grapheme' });
            const characters = [...segmenter.segment(text)].map(segment => segment.segment);
            let currentPosition = x;

            characters.forEach((char) => {
                ctx.fillText(char, currentPosition, y);
                const charWidth = ctx.measureText(char).width;
                currentPosition += charWidth + letterSpacing;
            });
        } catch(e) {
            ctx.fillText(text, x, y);
        }
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
            try {
                const segmenter = new Intl.Segmenter('th', { granularity: 'word' });
                const words = [...segmenter.segment(paragraph)].map(segment => segment.segment);

                let lines = [];
                let currentLine = '';

                words.forEach((word) => {
                    const testLine = currentLine + word;
                    const metrics = ctx.measureText(testLine);
                    const testWidth = metrics.width + (testLine.length - 1) * (letterSpacing || 0);

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
                        currentX = x - (ctx.measureText(line).width / 2) - ((line.length - 1) * (letterSpacing || 0)) / 2;
                    } else if (align === 'right') {
                        currentX = x - ctx.measureText(line).width - ((line.length - 1) * (letterSpacing || 0));
                    }

                    drawTextLine(ctx, line, currentX, currentY, letterSpacing);
                    currentY += (lineHeight > 10 ? lineHeight : fontSize * lineHeight); 
                    if (maxLines && index >= maxLines - 1) {
                        return;
                    }
                });
                currentY += (lineHeight > 10 ? lineHeight : fontSize * lineHeight);
            } catch (error) {
                let currentX = x;
                if (align === 'center') {
                    currentX = x - (ctx.measureText(paragraph).width / 2);
                } else if (align === 'right') {
                    currentX = x - ctx.measureText(paragraph).width;
                }
                ctx.fillText(paragraph, currentX, currentY);
                currentY += (lineHeight > 10 ? lineHeight : fontSize * lineHeight);
            }
        });
    }

    function drawImage(ctx, imageUrl, x, y, width, height) {
        const image = new Image();
        image.src = imageUrl;
        image.onload = function() {
            ctx.drawImage(image, x, y, width, height);
        };
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
        const Itemcode = getInputValue('Itemcode', '-');
        const amount11 = getInputValue('amount11', '-');
        const datetime = getInputValue('datetime-input', '-'); // อิงจาก HTML ที่เปลี่ยน ID
        const QRCode = getInputValue('QRCode', '');
        
        const noteToggleElem = document.getElementById('modeSwitch');
        const isNoteMode = noteToggleElem ? noteToggleElem.checked : false;
        const AideMemoire = getInputValue('AideMemoire', '-');

        const selectedImage = getInputValue('imageSelect', '');
        let backgroundSelect = getInputValue('backgroundSelect', '');

        let bankLogoUrl = '';
        let bankText = '';

        switch (bank) {
            case 'กสิกรไทย':          bankText = 'กสิกรไทย'; bankLogoUrl = 'assets/image/logo/KBANK1.png'; break;
            case 'กรุงไทย':           bankText = 'กรุงไทย'; bankLogoUrl = 'assets/image/logo/KTB3.png'; break;
            case 'กรุงเทพ':           bankText = 'กรุงเทพ'; bankLogoUrl = 'assets/image/logo/BBL3.png'; break;
            case 'ไทยพาณิชย์':        bankText = 'ไทยพาณิชย์'; bankLogoUrl = 'assets/image/logo/SCB.png'; break;
            case 'กรุงศรี':           bankText = 'กรุงศรี'; bankLogoUrl = 'assets/image/logo/BAY2.png'; break;
            case 'ทีเอ็มบีธนชาต':     bankText = 'ทีเอ็มบีธนชาต'; bankLogoUrl = 'assets/image/logo/TTB.png'; break;
            case 'ออมสิน':           bankText = 'ออมสิน'; bankLogoUrl = 'assets/image/logo/O2.png'; break;
            case 'ธ.ก.ส.':             bankText = 'ธ.ก.ส.'; bankLogoUrl = 'assets/image/logo/T1.png'; break;
            case 'ธ.อ.ส.':             bankText = 'ธ.อ.ส.'; bankLogoUrl = 'assets/image/logo/C2.png'; break;
            case 'เกียรตินาคินภัทร':  bankText = 'เกียรตินาคินภัทร'; bankLogoUrl = 'assets/image/logo/K.png'; break;
            case 'ซีไอเอ็มบี':        bankText = 'ซีไอเอ็มบี'; bankLogoUrl = 'assets/image/logo/C-CIMB.png'; break;
            case 'ยูโอบี':            bankText = 'ยูโอบี'; bankLogoUrl = 'assets/image/logo/UOB2.png'; break;
            case 'แลนด์ แอนด์ เฮ้าส์': bankText = 'แลนด์ แอนด์ เฮ้าส์'; bankLogoUrl = 'assets/image/logo/LHBANK.png'; break;
            case 'ไอซีบีซี':          bankText = 'ไอซีบีซี'; bankLogoUrl = 'assets/image/logo/ICBC.png'; break;
            case 'พร้อมเพย์':         bankText = 'พร้อมเพย์'; bankLogoUrl = 'assets/image/logo/P-Krungthai1.png'; break;
            case 'พร้อมเพย์ ':        bankText = 'พร้อมเพย์'; bankLogoUrl = 'assets/image/logo/P-Krungthai2.png'; break;
            case 'พร้อมเพย์  ':       bankText = 'พร้อมเพย์'; bankLogoUrl = 'assets/image/logo/P-Krungthai.png'; break;
            case 'ChillPay':          bankText = 'ChillPay'; bankLogoUrl = 'assets/image/logo/CP-KTB.png'; break;
            case 'SCB มณี SHOP':      bankText = 'SCB มณี SHOP'; bankLogoUrl = 'assets/image/logo/CP-KTB.png'; break;
            case 'MetaAds1':          bankText = 'MetaAds1'; bankLogoUrl = 'assets/image/logo/Meta4.png'; break;
            case 'MetaAds2':          bankText = 'MetaAds2'; bankLogoUrl = 'assets/image/logo/Meta4.png'; break;
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
        
        let backgroundImageSrc = backgroundSelect || 'assets/image/bs/KTB20.jpg';

        if (isNoteMode) {
            const bgNoteElem = document.getElementById('bg_note');
            if(bgNoteElem && bgNoteElem.value) {
                backgroundImageSrc = bgNoteElem.value;
            }

            if (backgroundImageSrc && !backgroundImageSrc.includes('T.jpg')) {
                backgroundImageSrc = backgroundImageSrc.replace('.jpg', 'T.jpg');
            }

            if (bank === 'ChillPay') {
                canvas.width = 986; canvas.height = 1277;
                backgroundImageSrc = backgroundImageSrc.replace('/KTB', '/CP-KTB');
            } else if (bank === 'SCB มณี SHOP') {
                canvas.width = 986; canvas.height = 1277;
                backgroundImageSrc = backgroundImageSrc.replace('/KTB', '/SCB-KTB'); 
            } else if (bank === 'MetaAds1' || bank === 'MetaAds2') {
                canvas.width = 986; canvas.height = 1277;
                backgroundImageSrc = backgroundImageSrc.replace('/KTB', '/META1-KTB');
            } else {
                canvas.width = 986; canvas.height = 1280;
            }
        } else {
            if (backgroundImageSrc && backgroundImageSrc.includes('T.jpg')) {
                backgroundImageSrc = backgroundImageSrc.replace('T.jpg', '.jpg');
            }

            if (bank === 'ChillPay') {
                canvas.width = 1008; canvas.height = 1262;
                backgroundImageSrc = backgroundImageSrc.replace('/KTB', '/CP-KTB');
            } else if (bank === 'SCB มณี SHOP') {
                canvas.width = 1008; canvas.height = 1262;
                backgroundImageSrc = backgroundImageSrc.replace('/KTB', '/SCB-KTB');
            } else if (bank === 'MetaAds1' || bank === 'MetaAds2') {
                canvas.width = 1008; canvas.height = 1262;
                backgroundImageSrc = backgroundImageSrc.replace('/KTB', '/META1-KTB'); 
            } else {
                canvas.width = 1008; canvas.height = 1280;
            }
        }

        let bgImg = await loadImage(backgroundImageSrc);
        let bankLogoImg = await loadImage(bankLogoUrl);
        let stickerImg = await loadImage((selectedImage && !selectedImage.includes('NO.png')) ? selectedImage : null);

        if (bgImg) {
            ctx.clearRect(0, 0, canvas.width, canvas.height);
            ctx.drawImage(bgImg, 0, 0, canvas.width, canvas.height);
        } else {
            ctx.fillStyle = '#1e293b'; ctx.fillRect(0, 0, canvas.width, canvas.height);
            ctx.fillStyle = '#ff4d4f'; ctx.font = '30px Kanit, sans-serif';
            ctx.fillText('❌ หาไฟล์พื้นหลังนี้ไม่เจอ!', 50, canvas.height / 2 - 40);
            ctx.fillStyle = '#ffffff'; ctx.font = '22px Kanit, sans-serif';
            ctx.fillText('Path: ' + backgroundImageSrc, 50, canvas.height / 2);
        }

        if (isNoteMode) {
            // ==========================================
            // โหมดมีบันทึกช่วยจำ
            // ==========================================
            if (bank === 'ChillPay') {
                if(bankLogoImg) ctx.drawImage(bankLogoImg,31,597, 117.5, 117.5); 
                drawText(ctx, `${formattedDate} - ${formattedTime}`,942.9,1114.0,39, 'DXKrungthaiMedium', '#000000', 'right', 1.5, 3, 0, 0, 800, -1.5);
                drawText(ctx, `${generateUniqueID() }`, 337.7,342.2,32.5, 'DXKrungthaiMedium', '#586970', 'left', 1.5, 1, 0, 0, 500, -0.5);
                drawText(ctx, `${sendername}`, 178.3, 445.3, 43.7, 'DXKrungthaiBold', '#000000', 'left', 1.5, 3, 0, 0, 800, -0.7);
                drawText(ctx, `***`, 178.3 + ctx.measureText(`${sendername}`).width - 7, 445.3, 43.7, 'DXKrungthaiRegular', '#000000', 'left', 1.5, 3, 0, 0, 800, -0.7);
                drawText(ctx, `กรุงไทย`, 178.3, 502.3,34.4, 'DXKrungthaiMedium', '#000000', 'left', 1.5, 2, 0, 0, 500, 0);
                drawText(ctx, `${senderaccount}`, 178.3, 555.6,34.4, 'DXKrungthaiMedium', '#586970', 'left', 1.5, 1, 0, 0, 500, -1.2);
                drawText(ctx, `ChillPay-${receivername}`, 178.3, 656.9,43.7, 'DXKrungthaiBold', '#000000', 'left', 1.5, 3, 0, 0, 800, -0.7);
                drawText(ctx, `${receiveraccount}`, 178.3, 713.3,34.4, 'DXKrungthaiMedium', '#586970', 'left', 1.5, 1, 0, 0, 500, -1.2);
                drawText(ctx, `${Itemcode}`, 942.9, 782,38, 'DXKrungthaiMedium', '#000000', 'right', 1.5, 2, 0, 0, 500, 0);
                const modifiedReceiverName = receivername.replace(/\s+/g, '');
                drawText(ctx, `${modifiedReceiverName}`, 942.9, 866,38, 'DXKrungthaiMedium', '#000000', 'right', 1.5, 2, 0, 0, 500, 0);
                drawText(ctx, `บาท`, 942.9, 972.3,39, 'DXKrungthaiMedium', '#000000', 'right', 1.5, 3, 0, 0, 500, -1.5);
                drawText(ctx, `${amount11}`, 868.8,972.3,52.50, 'DXKrungthaiBold', '#000000', 'right', 1.5, 3, 0, 0, 500, -1.5);
                drawText(ctx, `0.00 บาท`,942.9, 1046,39, 'DXKrungthaiMedium', '#000000', 'right', 1.5, 3, 0, 0, 500, -1.5);
                drawText(ctx, `${QRCode}`, 238.9, 599.0,33, 'DXKrungthaiMedium', '#4e4e4e', 'left', 1.5, 5, 0, 0, 500, 0);
                drawImage(ctx, 'assets/image/logo/KTB3.png', 31,389, 117.5, 117.5);  
                drawText(ctx, `${AideMemoire}`,942.9, 1183,39, 'DXKrungthaiMedium', '#000000', 'right', 1.5, 1, 0, 0, 800, -1.5);

            } else if (bank === 'SCB มณี SHOP') {
                if(bankLogoImg) ctx.drawImage(bankLogoImg,31,597, 117.5, 117.5);
                drawText(ctx, `${formattedDate} - ${formattedTime}`,942.9,1114.0,39, 'DXKrungthaiMedium', '#000000', 'right', 1.5, 3, 0, 0, 800, -1.5);
                drawText(ctx, `${generateUniqueID() }`, 337.7,342.2,32.5, 'DXKrungthaiMedium', '#586970', 'left', 1.5, 1, 0, 0, 500, -0.5);
                drawText(ctx, `${sendername}`, 178.3, 445.3, 43.7, 'DXKrungthaiBold', '#000000', 'left', 1.5, 3, 0, 0, 800, -0.7);
                drawText(ctx, `***`, 178.3 + ctx.measureText(`${sendername}`).width - 7, 445.3, 43.7, 'DXKrungthaiRegular', '#000000', 'left', 1.5, 3, 0, 0, 800, -0.7);
                drawText(ctx, `กรุงไทย`, 178.3, 502.3,34.4, 'DXKrungthaiMedium', '#000000', 'left', 1.5, 2, 0, 0, 500, 0);
                drawText(ctx, `${senderaccount}`, 178.3, 555.6,34.4, 'DXKrungthaiMedium', '#586970', 'left', 1.5, 1, 0, 0, 500, -1.2);
                drawText(ctx, `SCB มณี SHOP (${receivername})`, 178.3, 656.9,43.7, 'DXKrungthaiBold', '#000000', 'left', 1.5, 3, 0, 0, 800, -0.7);
                drawText(ctx, `(${receiveraccount})`, 178.3, 713.3,34.4, 'DXKrungthaiMedium', '#586970', 'left', 1.5, 1, 0, 0, 500, -1.2);
                drawText(ctx, `${Itemcode}`, 942.9, 782,38, 'DXKrungthaiMedium', '#000000', 'right', 1.5, 2, 0, 0, 500, 0);
                drawText(ctx, `SCB`, 942.9, 866,38, 'DXKrungthaiMedium', '#000000', 'right', 1.5, 2, 0, 0, 500, 0);
                drawText(ctx, `บาท`, 942.9, 972.3,39, 'DXKrungthaiMedium', '#000000', 'right', 1.5, 3, 0, 0, 500, -1.5);
                drawText(ctx, `${amount11}`, 868.8,972.3,52.50, 'DXKrungthaiBold', '#000000', 'right', 1.5, 3, 0, 0, 500, -1.5);
                drawText(ctx, `0.00 บาท`,942.9, 1046,39, 'DXKrungthaiMedium', '#000000', 'right', 1.5, 3, 0, 0, 500, -1.5);
                drawText(ctx, `${QRCode}`, 238.9, 599.0,33, 'DXKrungthaiMedium', '#4e4e4e', 'left', 1.5, 5, 0, 0, 500, 0);
                drawImage(ctx, 'assets/image/logo/KTB3.png', 31,389, 117.5, 117.5);  
                drawText(ctx, `${AideMemoire}`,942.9, 1183,39, 'DXKrungthaiMedium', '#000000', 'right', 1.5, 1, 0, 0, 800, -1.5);
                
            } else if (bank === 'MetaAds1') {
                if(bankLogoImg) ctx.drawImage(bankLogoImg,31,597, 117.5, 117.5);
                drawText(ctx, `${formattedDate} - ${formattedTime}`,942.9,1114.0,39, 'DXKrungthaiMedium', '#000000', 'right', 1.5, 3, 0, 0, 800, -1.5);
                drawText(ctx, `${generateUniqueID() }`, 337.7,342.2,32.5, 'DXKrungthaiMedium', '#586970', 'left', 1.5, 1, 0, 0, 500, -0.5);
                drawText(ctx, `${sendername}`, 178.3, 445.3, 43.7, 'DXKrungthaiBold', '#000000', 'left', 1.5, 3, 0, 0, 800, -0.7);
                drawText(ctx, `***`, 178.3 + ctx.measureText(`${sendername}`).width - 7, 445.3, 43.7, 'DXKrungthaiRegular', '#000000', 'left', 1.5, 3, 0, 0, 800, -0.7);
                drawText(ctx, `กรุงไทย`, 178.3, 502.3,34.4, 'DXKrungthaiMedium', '#000000', 'left', 1.5, 2, 0, 0, 500, 0);
                drawText(ctx, `${senderaccount}`, 178.3, 555.6,34.4, 'DXKrungthaiMedium', '#586970', 'left', 1.5, 1, 0, 0, 500, -1.2);
                drawText(ctx, `META ADS (KGP)`, 178.3, 656.9,43.7, 'DXKrungthaiBold', '#000000', 'left', 1.5, 3, 0, 0, 800, -0.7);
                drawText(ctx, `${Itemcode}`, 942.9, 782,38, 'DXKrungthaiMedium', '#000000', 'right', 1.5, 2, 0, 0, 500, 0);
                drawText(ctx, `${Itemcode}`, 942.9, 866,38, 'DXKrungthaiMedium', '#000000', 'right', 1.5, 2, 0, 0, 500, 0);
                drawText(ctx, `บาท`, 942.9, 972.3,39, 'DXKrungthaiMedium', '#000000', 'right', 1.5, 3, 0, 0, 500, -1.5);
                drawText(ctx, `${amount11}`, 868.8,972.3,52.50, 'DXKrungthaiBold', '#000000', 'right', 1.5, 3, 0, 0, 500, -1.5);
                drawText(ctx, `0.00 บาท`,942.9, 1046,39, 'DXKrungthaiMedium', '#000000', 'right', 1.5, 3, 0, 0, 500, -1.5);
                drawText(ctx, `${QRCode}`, 238.9, 599.0,33, 'DXKrungthaiMedium', '#4e4e4e', 'left', 1.5, 5, 0, 0, 500, 0);
                drawImage(ctx, 'assets/image/logo/KTB3.png', 31,389, 117.5, 117.5);  
                drawText(ctx, `${AideMemoire}`,942.9, 1183,39, 'DXKrungthaiMedium', '#000000', 'right', 1.5, 1, 0, 0, 800, -1.5);
            
            } else if (bank === 'MetaAds2') {
                if(bankLogoImg) ctx.drawImage(bankLogoImg,31,597, 117.5, 117.5);
                drawText(ctx, `${formattedDate} - ${formattedTime}`,942.9,1114.0,39, 'DXKrungthaiMedium', '#000000', 'right', 1.5, 3, 0, 0, 800, -1.5);
                drawText(ctx, `${generateUniqueID() }`, 337.7,342.2,32.5, 'DXKrungthaiMedium', '#586970', 'left', 1.5, 1, 0, 0, 500, -0.5);
                drawText(ctx, `${sendername}`, 178.3, 445.3, 43.7, 'DXKrungthaiBold', '#000000', 'left', 1.5, 3, 0, 0, 800, -0.7);
                drawText(ctx, `***`, 178.3 + ctx.measureText(`${sendername}`).width - 7, 445.3, 43.7, 'DXKrungthaiRegular', '#000000', 'left', 1.5, 3, 0, 0, 800, -0.7);
                drawText(ctx, `กรุงไทย`, 178.3, 502.3,34.4, 'DXKrungthaiMedium', '#000000', 'left', 1.5, 2, 0, 0, 500, 0);
                drawText(ctx, `${senderaccount}`, 178.3, 555.6,34.4, 'DXKrungthaiMedium', '#586970', 'left', 1.5, 1, 0, 0, 500, -1.2);
                drawText(ctx, `META ADS (KGP)`, 178.3, 656.9,43.7, 'DXKrungthaiBold', '#000000', 'left', 1.5, 3, 0, 0, 800, -0.7);
                drawText(ctx, `(${receiveraccount})`, 178.3, 713.3,34.4, 'DXKrungthaiMedium', '#586970', 'left', 1.5, 1, 0, 0, 500, -1.2);
                drawText(ctx, `${Itemcode}`, 942.9, 782,38, 'DXKrungthaiMedium', '#000000', 'right', 1.5, 2, 0, 0, 500, 0);
                drawText(ctx, `${Itemcode}`, 942.9, 866,38, 'DXKrungthaiMedium', '#000000', 'right', 1.5, 2, 0, 0, 500, 0);
                drawText(ctx, `บาท`, 942.9, 972.3,39, 'DXKrungthaiMedium', '#000000', 'right', 1.5, 3, 0, 0, 500, -1.5);
                drawText(ctx, `${amount11}`, 868.8,972.3,52.50, 'DXKrungthaiBold', '#000000', 'right', 1.5, 3, 0, 0, 500, -1.5);
                drawText(ctx, `0.00 บาท`,942.9, 1046,39, 'DXKrungthaiMedium', '#000000', 'right', 1.5, 3, 0, 0, 500, -1.5);
                drawText(ctx, `${QRCode}`, 238.9, 599.0,33, 'DXKrungthaiMedium', '#4e4e4e', 'left', 1.5, 5, 0, 0, 500, 0);
                drawImage(ctx, 'assets/image/logo/KTB3.png', 31,389, 117.5, 117.5);  
                drawText(ctx, `${AideMemoire}`,942.9, 1183,39, 'DXKrungthaiMedium', '#000000', 'right', 1.5, 1, 0, 0, 800, -1.5);
                
            } else {
                if(bankLogoImg) ctx.drawImage(bankLogoImg, 31, 651, 117.5, 117.5); 
                drawText(ctx, `${formattedDate} - ${formattedTime}`, 942.9, 1114.0, 39, 'DXKrungthaiMedium', '#000000', 'right', 1.5, 3, 0, 0, 800, -1.5);
                drawText(ctx, `${generateUniqueID() }`, 337.7, 342.2, 32.5, 'DXKrungthaiMedium', '#586970', 'left', 1.5, 1, 0, 0, 500, -0.5);
                drawText(ctx, `${sendername}`, 178.3, 495.1, 43.7, 'DXKrungthaiBold', '#000000', 'left', 1.5, 3, 0, 0, 800, -0.7);
                drawText(ctx, `***`, 178.3 + ctx.measureText(`${sendername}`).width - 7, 495.1, 43.7, 'DXKrungthaiRegular', '#000000', 'left', 1.5, 3, 0, 0, 800, -0.7);
                drawText(ctx, `กรุงไทย`, 178.3, 548.5, 34.4, 'DXKrungthaiMedium', '#000000', 'left', 1.5, 2, 0, 0, 500, 0);
                drawText(ctx, `${senderaccount}`, 178.3, 599, 34.4, 'DXKrungthaiMedium', '#586970', 'left', 1.5, 1, 0, 0, 500, -1.2);
                drawText(ctx, `${receivername}`, 178.3, 757.2, 43.7, 'DXKrungthaiBold', '#000000', 'left', 1.5, 3, 0, 0, 800, -0.7);
                drawText(ctx, bankText, 178.3, 810.0, 36.5, 'DXKrungthaiMedium', '#000000', 'left', 1.5, 2, 0, 0, 500, 0);
                drawText(ctx, `${receiveraccount}`, 178.3, 860.0, 37, 'DXKrungthaiMedium', '#586970', 'left', 1.5, 1, 0, 0, 500, -1.2);
                drawText(ctx, `บาท`, 942.9, 972.3, 39, 'DXKrungthaiMedium', '#000000', 'right', 1.5, 3, 0, 0, 500, -1.5);
                drawText(ctx, `${amount11}`, 868.8, 972.3, 52.50, 'DXKrungthaiBold', '#000000', 'right', 1.5, 3, 0, 0, 500, -1.5);
                drawText(ctx, `0.00 บาท`, 942.9, 1046, 39, 'DXKrungthaiMedium', '#000000', 'right', 1.5, 3, 0, 0, 500, -1.5);
                drawText(ctx, `${QRCode}`, 238.9, 599.0, 33, 'DXKrungthaiMedium', '#4e4e4e', 'left', 1.5, 5, 0, 0, 500, 0);
                drawImage(ctx, 'assets/image/logo/KTB3.png', 31.2, 406, 126.5, 126.5);  
                drawText(ctx, `${AideMemoire}`, 942.9, 1194, 39, 'DXKrungthaiMedium', '#000000', 'right', 1.5, 1, 0, 0, 800, -1.5);
            }

        } else {
            // ==========================================
            // โหมดปกติ (Standard Mode)
            // ==========================================
            if (bank === 'ChillPay') {
                if(bankLogoImg) ctx.drawImage(bankLogoImg, 31.2,618.5,126.5,126.5); 
                drawText(ctx, `${formattedDate} - ${formattedTime}`,963.7, 1176.9,41.50, 'DXKrungthaiMedium', '#000000', 'right', 1.5, 3, 0, 0, 800, -1.5);
                drawText(ctx, `${generateUniqueID()}`, 357.5, 357.3,34.5, 'DXKrungthaiMedium', '#586970', 'left', 1.5, 1, 0, 0, 500, -1);
                drawText(ctx, `${sendername}`, 188, 460, 47, 'DXKrungthaiBold', '#000000', 'left', 1.5, 3, 0, 0, 800, -0.6);
                drawText(ctx, `***`, 188 + ctx.measureText(`${sendername}`).width - 7, 460, 47, 'DXKrungthaiRegular', '#000000', 'left', 1.5, 3, 0, 0, 800, -0.6);
                drawText(ctx, `กรุงไทย`, 188, 518,36.5, 'DXKrungthaiMedium', '#000000', 'left', 1.5, 2, 0, 0, 500, 0);
                drawText(ctx, `${senderaccount}`,188, 572,37, 'DXKrungthaiMedium', '#586970', 'left', 1.5, 1, 0, 0, 500,-1.6);
                drawText(ctx, `ChillPay-${receivername}`, 188,677.2,47, 'DXKrungthaiBold', '#000000', 'left', 1.5, 3, 0, 0, 800, -0.6);
                drawText(ctx, `${receiveraccount}`, 188, 734.4,37, 'DXKrungthaiMedium', '#586970', 'left', 1.5, 1, 0, 0, 500,-1.6);
                drawText(ctx, `${Itemcode}`, 963.7, 830,38.5, 'DXKrungthaiMedium', '#000000', 'right', 1.5, 2, 0, 0, 500, 0);
                const modifiedReceiverName = receivername.replace(/\s+/g, '');
                drawText(ctx, `${modifiedReceiverName}`, 963.7, 915,38.5, 'DXKrungthaiMedium', '#000000', 'right', 1.5, 2, 0, 0, 500, 0);
                drawText(ctx, `บาท`, 963.7, 1025.7,41.50, 'DXKrungthaiMedium', '#000000', 'right', 1.5, 3, 0, 0, 500, -1.5);
                drawText(ctx, `${amount11}`, 883.5, 1025.7,56.80, 'DXKrungthaiBold', '#000000', 'right', 1.5, 3, 0, 0, 500, -1.5);
                drawText(ctx, `0.00 บาท`, 963.7, 1104.0,41.50, 'DXKrungthaiMedium', '#000000', 'right', 1.5, 3, 0, 0, 500, -1.5);
                drawText(ctx, `${QRCode}`, 238.9, 599.0,33, 'DXKrungthaiMedium', '#4e4e4e', 'left', 1.5, 5, 0, 0, 500, 0);
                drawImage(ctx, 'assets/image/logo/KTB3.png',31.2,406,126.5,126.5);         
                
            } else if (bank === 'SCB มณี SHOP') {
                if(bankLogoImg) ctx.drawImage(bankLogoImg, 31.2,618.5,126.5,126.5); 
                drawText(ctx, `${formattedDate} - ${formattedTime}`,963.7, 1176.9,41.50, 'DXKrungthaiMedium', '#000000', 'right', 1.5, 3, 0, 0, 800, -1.5);
                drawText(ctx, `${generateUniqueID()}`, 357.5, 357.3,34.5, 'DXKrungthaiMedium', '#586970', 'left', 1.5, 1, 0, 0, 500, -1);
                drawText(ctx, `${sendername}`, 188, 460, 47, 'DXKrungthaiBold', '#000000', 'left', 1.5, 3, 0, 0, 800, -0.6);
                drawText(ctx, `***`, 188 + ctx.measureText(`${sendername}`).width - 7, 460, 47, 'DXKrungthaiRegular', '#000000', 'left', 1.5, 3, 0, 0, 800, -0.6);
                drawText(ctx, `กรุงไทย`, 188, 518,36.5, 'DXKrungthaiMedium', '#000000', 'left', 1.5, 2, 0, 0, 500, 0);
                drawText(ctx, `${senderaccount}`,188, 572,37, 'DXKrungthaiMedium', '#586970', 'left', 1.5, 1, 0, 0, 500,-1.6);
                drawText(ctx, `SCB มณี SHOP (${receivername})`, 188,677.2,47, 'DXKrungthaiBold', '#000000', 'left', 1.5, 3, 0, 0, 800, -0.6);
                drawText(ctx, `(${receiveraccount})`, 188, 734.4,37, 'DXKrungthaiMedium', '#586970', 'left', 1.5, 1, 0, 0, 500,-1.6);
                drawText(ctx, `${Itemcode}`, 963.7, 830,38.5, 'DXKrungthaiMedium', '#000000', 'right', 1.5, 2, 0, 0, 500, 0);
                drawText(ctx, `SCB`, 963.7, 915,38.5, 'DXKrungthaiMedium', '#000000', 'right', 1.5, 2, 0, 0, 500, 0);
                drawText(ctx, `บาท`, 963.7, 1025.7,41.50, 'DXKrungthaiMedium', '#000000', 'right', 1.5, 3, 0, 0, 500, -1.5);
                drawText(ctx, `${amount11}`, 883.5, 1025.7,56.80, 'DXKrungthaiBold', '#000000', 'right', 1.5, 3, 0, 0, 500, -1.5);
                drawText(ctx, `0.00 บาท`, 963.7, 1104.0,41.50, 'DXKrungthaiMedium', '#000000', 'right', 1.5, 3, 0, 0, 500, -1.5);
                drawText(ctx, `${QRCode}`, 238.9, 599.0,33, 'DXKrungthaiMedium', '#4e4e4e', 'left', 1.5, 5, 0, 0, 500, 0);
                drawImage(ctx, 'assets/image/logo/KTB3.png',31.2,406,126.5,126.5);

            } else if (bank === 'MetaAds1') {
                if(bankLogoImg) ctx.drawImage(bankLogoImg, 31.2,618.5,126.5,126.5); 
                drawText(ctx, `${formattedDate} - ${formattedTime}`,963.7, 1176.9,41.50, 'DXKrungthaiMedium', '#000000', 'right', 1.5, 3, 0, 0, 800, -1.5);
                drawText(ctx, `${generateUniqueID()}`, 357.5, 357.3,34.5, 'DXKrungthaiMedium', '#586970', 'left', 1.5, 1, 0, 0, 500, -1);
                drawText(ctx, `${sendername}`, 188, 460, 47, 'DXKrungthaiBold', '#000000', 'left', 1.5, 3, 0, 0, 800, -0.6);
                drawText(ctx, `***`, 188 + ctx.measureText(`${sendername}`).width - 7, 460, 47, 'DXKrungthaiRegular', '#000000', 'left', 1.5, 3, 0, 0, 800, -0.6);
                drawText(ctx, `กรุงไทย`, 188, 518,36.5, 'DXKrungthaiMedium', '#000000', 'left', 1.5, 2, 0, 0, 500, 0);
                drawText(ctx, `${senderaccount}`,188, 572,37, 'DXKrungthaiMedium', '#586970', 'left', 1.5, 1, 0, 0, 500,-1.6);
                drawText(ctx, `META ADS (KGP)`, 188,677.2,47, 'DXKrungthaiBold', '#000000', 'left', 1.5, 3, 0, 0, 800, -0.6);
                drawText(ctx, `${Itemcode}`, 963.7, 830,38.5, 'DXKrungthaiMedium', '#000000', 'right', 1.5, 2, 0, 0, 300, 0);
                drawText(ctx, `${Itemcode}`, 963.7, 915,38.5, 'DXKrungthaiMedium', '#000000', 'right', 1.5, 2, 0, 0, 300, 0);
                drawText(ctx, `บาท`, 963.7, 1025.7,41.50, 'DXKrungthaiMedium', '#000000', 'right', 1.5, 3, 0, 0, 500, -1.5);
                drawText(ctx, `${amount11}`, 883.5, 1025.7,56.80, 'DXKrungthaiBold', '#000000', 'right', 1.5, 3, 0, 0, 500, -1.5);
                drawText(ctx, `0.00 บาท`, 963.7, 1104.0,41.50, 'DXKrungthaiMedium', '#000000', 'right', 1.5, 3, 0, 0, 500, -1.5);
                drawText(ctx, `${QRCode}`, 238.9, 599.0,33, 'DXKrungthaiMedium', '#4e4e4e', 'left', 1.5, 5, 0, 0, 500, 0);
                drawImage(ctx, 'assets/image/logo/KTB3.png',31.2,406,126.5,126.5);         
                
            } else if (bank === 'MetaAds2') {
                if(bankLogoImg) ctx.drawImage(bankLogoImg, 31.2,618.5,126.5,126.5); 
                drawText(ctx, `${formattedDate} - ${formattedTime}`,963.7, 1176.9,41.50, 'DXKrungthaiMedium', '#000000', 'right', 1.5, 3, 0, 0, 800, -1.5);
                drawText(ctx, `${generateUniqueID()}`, 357.5, 357.3,34.5, 'DXKrungthaiMedium', '#586970', 'left', 1.5, 1, 0, 0, 500, -1);
                drawText(ctx, `${sendername}`, 188, 460, 47, 'DXKrungthaiBold', '#000000', 'left', 1.5, 3, 0, 0, 800, -0.6);
                drawText(ctx, `***`, 188 + ctx.measureText(`${sendername}`).width - 7, 460, 47, 'DXKrungthaiRegular', '#000000', 'left', 1.5, 3, 0, 0, 800, -0.6);
                drawText(ctx, `กรุงไทย`, 188, 518,36.5, 'DXKrungthaiMedium', '#000000', 'left', 1.5, 2, 0, 0, 500, 0);
                drawText(ctx, `${senderaccount}`,188, 572,37, 'DXKrungthaiMedium', '#586970', 'left', 1.5, 1, 0, 0, 500,-1.6);
                drawText(ctx, `META ADS (KGP)`, 188,677.2,47, 'DXKrungthaiBold', '#000000', 'left', 1.5, 3, 0, 0, 800, -0.6);
                drawText(ctx, `(${receiveraccount})`, 188, 734.4,37, 'DXKrungthaiMedium', '#586970', 'left', 1.5, 1, 0, 0, 500,-1.6);
                drawText(ctx, `${Itemcode}`, 963.7, 830,38.5, 'DXKrungthaiMedium', '#000000', 'right', 1.5, 2, 0, 0, 300, 0);
                drawText(ctx, `${Itemcode}`, 963.7, 915,38.5, 'DXKrungthaiMedium', '#000000', 'right', 1.5, 2, 0, 0, 300, 0);
                drawText(ctx, `บาท`, 963.7, 1025.7,41.50, 'DXKrungthaiMedium', '#000000', 'right', 1.5, 3, 0, 0, 500, -1.5);
                drawText(ctx, `${amount11}`, 883.5, 1025.7,56.80, 'DXKrungthaiBold', '#000000', 'right', 1.5, 3, 0, 0, 500, -1.5);
                drawText(ctx, `0.00 บาท`, 963.7, 1104.0,41.50, 'DXKrungthaiMedium', '#000000', 'right', 1.5, 3, 0, 0, 500, -1.5);
                drawText(ctx, `${QRCode}`, 238.9, 599.0,33, 'DXKrungthaiMedium', '#4e4e4e', 'left', 1.5, 5, 0, 0, 500, 0);
                drawImage(ctx, 'assets/image/logo/KTB3.png',31.2,406,126.5,126.5);  
                
            } else {
                if(bankLogoImg) ctx.drawImage(bankLogoImg, 31.2,684.5,126.5,126.5); 
                drawText(ctx, `${formattedDate} - ${formattedTime}`,963.7, 1176.9,41.50, 'DXKrungthaiMedium', '#000000', 'right', 1.5, 3, 0, 0, 800, -1.5);
                drawText(ctx, `${generateUniqueID()}`, 357.5, 357.3,34.5, 'DXKrungthaiMedium', '#586970', 'left', 1.5, 1, 0, 0, 500, -1);
                drawText(ctx, `${sendername}`, 188, 519, 47, 'DXKrungthaiBold', '#000000', 'left', 1.5, 3, 0, 0, 800, -0.6);
                drawText(ctx, `***`, 188 + ctx.measureText(`${sendername}`).width - 7, 519, 47, 'DXKrungthaiRegular', '#000000', 'left', 1.5, 3, 0, 0, 800, -0.6);
                drawText(ctx, `กรุงไทย`, 188, 577,36.5, 'DXKrungthaiMedium', '#000000', 'left', 1.5, 2, 0, 0, 500, 0);
                drawText(ctx, `${senderaccount}`,188, 631,37, 'DXKrungthaiMedium', '#586970', 'left', 1.5, 1, 0, 0, 500,-1.6);
                drawText(ctx, `${receivername}`, 188,796.3,47, 'DXKrungthaiBold', '#000000', 'left', 1.5, 3, 0, 0, 800, -0.6);
                drawText(ctx, bankText, 188, 853.8,36.5, 'DXKrungthaiMedium', '#000000', 'left', 1.5, 2, 0, 0, 500, 0);
                drawText(ctx, `${receiveraccount}`, 188, 908.1,37, 'DXKrungthaiMedium', '#586970', 'left', 1.5, 1, 0, 0, 500,-1.6);
                drawText(ctx, `บาท`, 963.7, 1025.7,41.50, 'DXKrungthaiMedium', '#000000', 'right', 1.5, 3, 0, 0, 500, -1.5);
                drawText(ctx, `${amount11}`, 883.5, 1025.7,56.80, 'DXKrungthaiBold', '#000000', 'right', 1.5, 3, 0, 0, 500, -1.5);
                drawText(ctx, `0.00 บาท`, 963.7, 1104.0,41.50, 'DXKrungthaiMedium', '#000000', 'right', 1.5, 3, 0, 0, 500, -1.5);
                drawText(ctx, `${QRCode}`, 238.9, 599.0,33, 'DXKrungthaiMedium', '#4e4e4e', 'left', 1.5, 5, 0, 0, 500, 0);
                drawImage(ctx, 'assets/image/logo/KTB3.png',31.2,406,126.5,126.5);  
            }

            if (stickerImg && selectedImage !== 'assets/image/st/NO.png') {
                ctx.drawImage(stickerImg, 0, 0, canvas.width, canvas.height); 
            }
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
        link.download = 'slip_ktb.png';
        link.click();
    };

})();
