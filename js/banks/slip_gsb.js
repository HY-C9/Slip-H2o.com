// js/banks/slip_gsb.js
// รวมระบบสร้างสลิปออมสิน (GSB) ทั้งโหมดปกติ และ โหมดบันทึกช่วยจำ (Note)

(function() {
    const fontPath = 'assets/fonts';
    let fontsLoaded = false;

    // ==========================================
    // 1. ระบบโหลดฟอนต์ทั้งหมด
    // ==========================================
    async function loadFonts() {
        const fonts = [
            new FontFace('SFThonburiRegular', `url(${fontPath}/SFThonburi-Regular.woff)`),
            new FontFace('SFThonburiBold', `url(${fontPath}/SFThonburi-Bold.woff)`)
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
        const fixedPart1 = "428"; 
        const fixedPart2 = "I0000"; 
        const fixedPart3 = "B9790"; 
        const randomPart1 = Math.floor(Math.random() * 1000000000).toString().padStart(9, '0');
        const randomPart2 = Math.floor(Math.random() * 30) + 1;
        return `${fixedPart1}${randomPart1}${fixedPart2}${randomPart2.toString().padStart(2, '0')}${fixedPart3}`;
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
    // ฟังก์ชันช่วยวาดข้อความ (Text) จัดการสระลอย
    // ==========================================
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

                if (maxWidth && testWidth > maxWidth && currentLine !== '') {
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
        
        // รองรับทั้ง datetime-input (โค้ดใหม่) และ datetime (เผื่อมีคนใช้ id เก่า)
        const datetimeVal = document.getElementById('datetime-input')?.value || document.getElementById('datetime')?.value || '-';
        const datetime = datetimeVal;

        const AideMemoire = getInputValue('AideMemoire', '-');
        const selectedImage = getInputValue('imageSelect', '');

        const noteToggleElem = document.getElementById('modeSwitch');
        const isNoteMode = noteToggleElem ? noteToggleElem.checked : false;

        let bankLogoUrl = '';
        switch (bank) {
            case 'ธนาคารกสิกรไทย': bankLogoUrl = 'assets/image/logo/KBANK.png'; break;
            case 'ธนาคารกรุงไทย': bankLogoUrl = 'assets/image/logo/KTB.png'; break;
            case 'ธนาคารกรุงเทพ': bankLogoUrl = 'assets/image/logo/BBL.png'; break;
            case 'ธนาคารไทยพาณิชย์': bankLogoUrl = 'assets/image/logo/SCB.png'; break;
            case 'ธนาคารกรุงศรีอยุธยา': bankLogoUrl = 'assets/image/logo/BAY.png'; break;
            case 'ธนาคารทหารไทยธนชาต': bankLogoUrl = 'assets/image/logo/TTB2.png'; break;
            case 'ธนาคารออมสิน': bankLogoUrl = 'assets/image/logo/O3.png'; break;
            case 'ธนาคารเพื่อการเกษตรและสหกรณ์การเกษตร': bankLogoUrl = 'assets/image/logo/T3.png'; break;
            case 'ธนาคารอาคารสงเคราะห์': bankLogoUrl = 'assets/image/logo/C.png'; break;
            case 'ธนาคารเกียรตินาคินภัทร': bankLogoUrl = 'assets/image/logo/K.png'; break;
            case 'ธนาคารซีไอเอ็มบีไทย': bankLogoUrl = 'assets/image/logo/CIMB1.png'; break;
            case 'ธนาคารยูโอบี': bankLogoUrl = 'assets/image/logo/UOB3.png'; break;
            case 'ธนาคารแลนด์แอนด์เฮ้าส์': bankLogoUrl = 'assets/image/logo/LHBANK.png'; break;
            case 'ธนาคารไอซีบีซี': bankLogoUrl = 'assets/image/logo/ICBC.png'; break;
            case 'พร้อมเพย์': bankLogoUrl = 'assets/image/logo/P-savings.png'; break;
            case 'เติมเงินพร้อมเพย์': bankLogoUrl = 'assets/image/logo/P-savings1.png'; break;
            case 'MetaAds': bankLogoUrl = 'assets/image/logo/P-savings.png'; break;
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

        // ==========================================
        // จัดการพื้นหลัง โหมดบันทึก / โหมดปกติ
        // ==========================================
        let backgroundImageSrc = '';
        
        if (isNoteMode) {
            if (bank === 'MetaAds') {
                canvas.width = 567; canvas.height = 1346;
                backgroundImageSrc = 'assets/image/bs/OO1T.jpg';
            } else if (bank === 'ธนาคารออมสิน') {
                canvas.width = 567; canvas.height = 1280;
                backgroundImageSrc = 'assets/image/bs/O1.1T.jpg'; 
            } else if (bank === 'ธนาคารเพื่อการเกษตรและสหกรณ์การเกษตร') {
                canvas.width = 567; canvas.height = 1346;
                backgroundImageSrc = 'assets/image/bs/OO1.1T.jpg'; 
            } else if (bank === 'เติมเงินพร้อมเพย์') {
                canvas.width = 567; canvas.height = 1280;
                backgroundImageSrc = 'assets/image/bs/O1.2T.jpg'; 
            } else {
                canvas.width = 567; canvas.height = 1280;
                backgroundImageSrc = 'assets/image/bs/O1T.jpg'; // ค่าเริ่มต้นโหมด T
            }
            
            // เช็คว่าผู้ใช้เลือกลายโน้ตแบบอื่นไหม
            const bgNoteElem = document.getElementById('bg_note');
            if (bgNoteElem && bgNoteElem.value && bank === 'ธนาคารออมสิน') {
                backgroundImageSrc = bgNoteElem.value;
            }
        } else {
            if (bank === 'MetaAds') {
                canvas.width = 617; canvas.height = 1334;
                backgroundImageSrc = 'assets/image/bs/OO1.jpg';
            } else if (bank === 'ธนาคารออมสิน') {
                canvas.width = 617; canvas.height = 1280;
                backgroundImageSrc = 'assets/image/bs/O1.1.jpg'; 
            } else if (bank === 'ธนาคารเพื่อการเกษตรและสหกรณ์การเกษตร') {
                canvas.width = 617; canvas.height = 1334;
                backgroundImageSrc = 'assets/image/bs/OO1.1.jpg'; 
            } else if (bank === 'เติมเงินพร้อมเพย์') {
                canvas.width = 617; canvas.height = 1280;
                backgroundImageSrc = 'assets/image/bs/O1.2.jpg'; 
            } else {
                canvas.width = 617; canvas.height = 1280;
                backgroundImageSrc = 'assets/image/bs/O1.jpg'; // ค่าเริ่มต้นโหมดปกติ
            }
            
            // เช็คว่าผู้ใช้เลือกลายปกติแบบอื่นไหม
            const bgNormalElem = document.getElementById('backgroundSelect');
            if (bgNormalElem && bgNormalElem.value && bank === 'ธนาคารออมสิน') {
                backgroundImageSrc = bgNormalElem.value;
            }
        }

        const [bgImg, bankLogoImg, customStickerImg, mainLogoImg] = await Promise.all([
            loadImage(backgroundImageSrc),
            loadImage(bankLogoUrl),
            loadImage((selectedImage && !selectedImage.includes('NO.png')) ? selectedImage : null),
            loadImage('assets/image/logo/O3.png') // โลโก้ออมสินด้านบน
        ]);

        if (bgImg) {
            ctx.clearRect(0, 0, canvas.width, canvas.height);
            ctx.drawImage(bgImg, 0, 0, canvas.width, canvas.height);
        } else {
            ctx.fillStyle = '#1e293b'; ctx.fillRect(0, 0, canvas.width, canvas.height);
            ctx.fillStyle = '#ff4d4f'; ctx.font = '20px SFThonburiBold';
            ctx.fillText('❌ หาไฟล์พื้นหลังไม่เจอ!', 50, canvas.height / 2);
        }

        // ==========================================
        // วาดรายละเอียดลงสลิป
        // ==========================================
        if (isNoteMode) {
            // 🟢 โหมดมีบันทึกช่วยจำ (Canvas width 567)
            if(bankLogoImg) ctx.drawImage(bankLogoImg, 66, 551, 71, 71); 
            if(mainLogoImg) ctx.drawImage(mainLogoImg, 66, 376, 71, 71);  
            
            drawText(ctx, `${amount11}`, 283.5, 206.6, 42, 'SFThonburiBold', '#000000', 'center', 1.5, 3, 0, 0, 500, 0);
            drawText(ctx, `0.00 ค่าธรรมเนียม`, 283.5, 241, 19.5, 'SFThonburiBold', '#979797', 'center', 1.5, 3, 0, 0, 500, 0);
            drawText(ctx, `รหัสอ้างอิง: ${generateUniqueID()}`, 283.5, 265.5, 19.5, 'SFThonburiRegular', '#979797', 'center', 1.5, 3, 0, 0, 500, -0.7);
            drawText(ctx, `${formattedDate}    ${formattedTime}`, 283.5, 297, 19.5, 'SFThonburiBold', '#000000', 'center', 1.5, 3, 0, 0, 500, 0);

            drawText(ctx, `${sendername}`, 149.2, 410, 31, 'SFThonburiBold', '#000000', 'left', 1.5, 3, 0, 0, 500, -0.50);
            drawText(ctx, `ธนาคารออมสิน`, 149.2, 441.9, 23, 'SFThonburiRegular', '#525252', 'left', 1.5, 2, 0, 0, 500, 0);
            drawText(ctx, `${senderaccount}`, 149.2, 471.5, 23, 'SFThonburiRegular', '#525252', 'left', 1.5, 1, 0, 0, 500, -1);

            if (bank === 'MetaAds') {
                drawText(ctx, `${AideMemoire}`, 149.2, 819.1, 23, 'SFThonburiRegular', '#525252', 'left', 1.5, 2, 0, 0, 500, 0);
                drawText(ctx, `META ADS (KGP)`, 149.2, 585.5, 31, 'SFThonburiBold', '#000000', 'left', 1.5, 3, 0, 0, 500, -0.50);
                drawText(ctx, `หมายเลขอ้างอิง 1:`, 149.2, 619, 23, 'SFThonburiRegular', '#525252', 'left', 1.5, 2, 0, 0, 500, 0);
                drawText(ctx, `${receiveraccount}`, 149.2, 646.9, 23, 'SFThonburiRegular', '#525252', 'left', 1.5, 1, 0, 0, 500, -1);
                drawText(ctx, `หมายเลขอ้างอิง 2:`, 149.2, 674.8, 23, 'SFThonburiRegular', '#525252', 'left', 1.5, 2, 0, 0, 500, 0);
                drawText(ctx, `${receiveraccount}`, 149.2, 702.7, 23, 'SFThonburiRegular', '#525252', 'left', 1.5, 1, 0, 0, 500, -1);
            } else if (bank === 'ธนาคารเพื่อการเกษตรและสหกรณ์การเกษตร') {
                drawText(ctx, `${AideMemoire}`, 149.2, 791.1, 23, 'SFThonburiRegular', '#525252', 'left', 1.5, 2, 0, 0, 500, 0);
                drawText(ctx, `${receivername}`, 149.2, 585.5, 31, 'SFThonburiBold', '#000000', 'left', 1.5, 3, 0, 0, 500, -0.50);
                drawText(ctx, `${bank}`, 149.2, 619, 23, 'SFThonburiRegular', '#525252', 'left', 28, 2, 0, 0, 350, 0);
                drawText(ctx, `${receiveraccount}`, 149.2, 673.9, 23, 'SFThonburiRegular', '#525252', 'left', 1.5, 1, 0, 0, 500, -1);
            } else {
                drawText(ctx, `${AideMemoire}`, 149.2, 753.1, 23, 'SFThonburiRegular', '#525252', 'left', 1.5, 2, 0, 0, 500, 0);
                drawText(ctx, `${receivername}`, 149.2, 585.5, 31, 'SFThonburiBold', '#000000', 'left', 1.5, 3, 0, 0, 500, -0.50);
                drawText(ctx, `${bank}`, 149.2, 619, 23, 'SFThonburiRegular', '#525252', 'left', 1.5, 2, 0, 0, 500, 0);
                drawText(ctx, `${receiveraccount}`, 149.2, 646.9, 23, 'SFThonburiRegular', '#525252', 'left', 1.5, 1, 0, 0, 500, -1);
            }
        } else {
            // 🔵 โหมดปกติ (Canvas width 617)
            if(bankLogoImg) ctx.drawImage(bankLogoImg, 71, 601, 78, 78);
            if(mainLogoImg) ctx.drawImage(mainLogoImg, 71, 409.5, 78, 78);  
            
            drawText(ctx, `${amount11}`, 308.5, 225.1, 45, 'SFThonburiBold', '#000000', 'center', 1.5, 3, 0, 0, 500, 0);
            drawText(ctx, `0.00 ค่าธรรมเนียม`, 308.5, 262.7, 21, 'SFThonburiBold', '#979797', 'center', 1.5, 3, 0, 0, 500, 0);
            drawText(ctx, `รหัสอ้างอิง: ${generateUniqueID()}`, 308.5, 290.3, 21, 'SFThonburiRegular', '#979797', 'center', 1.5, 3, 0, 0, 500, -0.7);
            drawText(ctx, `${formattedDate}    ${formattedTime}`, 308.5, 323.4, 21, 'SFThonburiBold', '#000000', 'center', 1.5, 3, 0, 0, 500, 0);

            drawText(ctx, `${sendername}`, 163.4, 446.5, 33, 'SFThonburiBold', '#000000', 'left', 1.5, 3, 0, 0, 500, -0.50);
            drawText(ctx, `ธนาคารออมสิน`, 163.4, 482.8, 25, 'SFThonburiRegular', '#525252', 'left', 1.5, 2, 0, 0, 500, 0);
            drawText(ctx, `${senderaccount}`, 163.4, 512.7, 25, 'SFThonburiRegular', '#525252', 'left', 1.5, 1, 0, 0, 500, -1);
        
            if (bank === 'MetaAds') {
                drawText(ctx, `META ADS (KGP)`, 163.4, 637.7, 33, 'SFThonburiBold', '#000000', 'left', 1.5, 3, 0, 0, 500, -0.50);
                drawText(ctx, `หมายเลขอ้างอิง 1:`, 163.4, 674.2, 25, 'SFThonburiRegular', '#525252', 'left', 1.5, 1, 0, 0, 500, -1);
                drawText(ctx, `${receiveraccount}`, 163.4, 705.2, 25, 'SFThonburiRegular', '#525252', 'left', 1.5, 1, 0, 0, 500, -1);
                drawText(ctx, `หมายเลขอ้างอิง 2:`, 163.4, 735.2, 25, 'SFThonburiRegular', '#525252', 'left', 1.5, 1, 0, 0, 500, -1);
                drawText(ctx, `${receiveraccount}`, 163.4, 766.2, 25, 'SFThonburiRegular', '#525252', 'left', 1.5, 1, 0, 0, 500, -1);
            } else if (bank === 'ธนาคารเพื่อการเกษตรและสหกรณ์การเกษตร') {
                drawText(ctx, `${receivername}`, 163.4, 637.7, 33, 'SFThonburiBold', '#000000', 'left', 1.5, 3, 0, 0, 500, -0.50);
                drawText(ctx, `${bank}`, 163.4, 674.2, 25, 'SFThonburiRegular', '#525252', 'left', 31, 2, 0, 0, 350, 0);
                drawText(ctx, `${receiveraccount}`, 163.4, 736.2, 25, 'SFThonburiRegular', '#525252', 'left', 1.5, 1, 0, 0, 500, -1);
            } else {
                drawText(ctx, `${receivername}`, 163.4, 637.7, 33, 'SFThonburiBold', '#000000', 'left', 1.5, 3, 0, 0, 500, -0.50);
                drawText(ctx, `${bank}`, 163.4, 674.2, 25, 'SFThonburiRegular', '#525252', 'left', 1.5, 2, 0, 0, 500, 0);
                drawText(ctx, `${receiveraccount}`, 163.4, 705.2, 25, 'SFThonburiRegular', '#525252', 'left', 1.5, 1, 0, 0, 500, -1);
            }
        }

        // วาดสติ๊กเกอร์
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
        link.download = 'slip_gsb.png';
        link.click();
    };

})();