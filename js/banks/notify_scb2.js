(function() {
    let cachedBgImage = new Image();
    let currentBgSrc = '';

    function loadFonts() {
        const fonts = [
            new FontFace('SFThonburiLight', 'url(assets/fonts/SFThonburi.woff)'),
            new FontFace('SFThonburiRegular', 'url(assets/fonts/SFThonburi-Regular.woff)'),
            new FontFace('SFThonburiSemiBold', 'url(assets/fonts/SFThonburi-Semibold.woff)'),
            new FontFace('SFThonburiBold', 'url(assets/fonts/SFThonburi-Bold.woff)')
        ];

        return Promise.allSettled(fonts.map(font => font.load())).then(results => {
            results.forEach(result => {
                if (result.status === 'fulfilled') document.fonts.add(result.value);
            });
        });
    }

    function padZero(number) {
        return number < 10 ? '0' + number : number;
    }

    function formatDateWithDay(dateString) {
        const d = new Date(dateString);
        if (isNaN(d)) return '-';
        const days = ['วันอาทิตย์', 'วันจันทร์', 'วันอังคาร', 'วันพุธ', 'วันพฤหัสบดี', 'วันศุกร์', 'วันเสาร์'];
        const months = ['มกราคม', 'กุมภาพันธ์', 'มีนาคม', 'เมษายน', 'พฤษภาคม', 'มิถุนายน', 'กรกฎาคม', 'สิงหาคม', 'กันยายน', 'ตุลาคม', 'พฤศจิกายน', 'ธันวาคม'];
        return `${days[d.getDay()]}ที่ ${d.getDate()} ${months[d.getMonth()]}`;
    }

    function formatDate(dateString) {
        const d = new Date(dateString);
        if (isNaN(d)) return '-';
        const day = padZero(d.getDate());
        const month = padZero(d.getMonth() + 1);
        const year = "20" + d.getFullYear().toString().slice(-2);
        return `${day}/${month}/${year}`;
    }

    window.updateDisplay = function() {
        const canvas = document.getElementById('canvas');
        if (!canvas) return;
        const ctx = canvas.getContext('2d');

        const activeBgMode = document.getElementById('activeBgMode')?.value || 'system';
        const customBgUrl = document.getElementById('customImageDataUrl')?.value || '';
        const bgSelect = document.getElementById('backgroundSelect')?.value || 'assets/image/bs/backgroundEnter-SCB2.1.jpg';

        const datetime = document.getElementById('datetime')?.value || '-';
        const datetimePlusOne = document.getElementById('datetime_plus_one')?.value || '-';
        const batteryLevel = document.getElementById('battery')?.value || '100';
        
        // ดึงสถานะโหมดประหยัดพลังงานจากปุ่มใน HTML
        const isPowerSaving = document.getElementById('powerSavingMode')?.classList.contains('btn-warning') || false;

        const money01 = document.getElementById('money01')?.value || '-';
        const name1 = document.getElementById('name1')?.value || '-';
        const money10 = document.getElementById('money10')?.value || '-';
        const senderaccount1 = document.getElementById('senderaccount1')?.value || '-';
        const bank1 = document.getElementById('bank1')?.value || '-';
        const receiveraccount = document.getElementById('receiveraccount')?.value || '-';

        const formattedDate = formatDate(datetime.substring(0, 10)); 
        const formattedDateWithDay = formatDateWithDay(datetime.substring(0, 10)); 
        const formattedTime = datetime.length > 11 ? datetime.substring(11, 16) : '-'; 
        const formattedTimePlusOne = datetimePlusOne;

        let timeDifference = Math.floor((new Date(`1970-01-01T${formattedTimePlusOne}:00Z`) - new Date(`1970-01-01T${formattedTime}:00Z`)) / 60000);
        let timeMessage = "ตอนนี้";
        if (timeDifference >= 60) timeMessage = `${Math.floor(timeDifference / 60)} ชั่วโมงที่แล้ว`;
        else if (timeDifference > 1) timeMessage = `${timeDifference} นาทีที่แล้ว`;
        else if (timeDifference === 1) timeMessage = "1 นาทีที่แล้ว";

        // ฟังก์ชันวาดเฉพาะข้อความและแบตเตอรี่ (ไม่วาดกรอบ)
        const drawUI = () => {
            drawText(ctx, `   ${formattedDateWithDay}   `, 308, 167.8, 33.50, 'SFThonburiSemiBold', '#ffffff', 'center', 24, 3, 0, 0, 800, 0);
            drawText(ctx, `${formattedTimePlusOne}`, 295, 298.8, 138.50, 'SFThonburiSemiBold', '#ffffff', 'center', 1.5, 3, 0, 0, 800, -7);

            drawText(ctx, `SCB Connect`, 107.8, 942, 21.50, 'SFThonburiBold', '#000000', 'left', 1.5, 3, 0, 0, 800, 0);
            drawText(ctx, `${timeMessage}`, 547.5, 942, 18.50, 'SFThonburiRegular', '#6f8590', 'right', 1.5, 3, 0, 0, 800, 0);

            const detailMsg = `เงินเข้า: มีเงินโอน ${money01} บาท จาก ${name1} บัญชี ${receiveraccount} ธนาคาร ${bank1} เข้าบัญชีออมทรัพย์ ${senderaccount1} วันที่ ${formattedDate} @${formattedTime} ผ่าน ENET ยอดเงินที่ใช้ได้ ${money10} บาท`;
            drawText(ctx, detailMsg, 107.8, 972, 20.50, 'SFThonburiRegular', '#000000', 'left', 31.5, 3, 0, 0, 425, -0.25);

            drawBattery(ctx, batteryLevel, isPowerSaving);
        };

        const drawOverlaysAndUI = () => {
            let loadedCount = 0;
            const img1 = new Image();
            const img2 = new Image();
            let img1Success = false, img2Success = false;

            const checkAndDrawText = () => {
                loadedCount++;
                if (loadedCount === 2) {
                    if (img1Success) {
                        ctx.globalAlpha = 0.80; // สามารถปรับความใสของกรอบได้ตรงนี้ (0.0 - 1.0)
                        ctx.drawImage(img1, 0, 0, canvas.width, canvas.height);
                        ctx.globalAlpha = 1.0; 
                    }
                    if (img2Success) {
                        ctx.drawImage(img2, 0, 0, canvas.width, canvas.height);
                    }
                    
                    drawUI();
                }
            };

            img1.onload = () => { img1Success = true; checkAndDrawText(); };
            img1.onerror = () => { checkAndDrawText(); };
            img1.src = 'assets/image/bs/backgroundEnter-SCB2.666.png'; 

            img2.onload = () => { img2Success = true; checkAndDrawText(); };
            img2.onerror = () => { checkAndDrawText(); };
            img2.src = 'assets/image/bs/backgroundEnter-SCB2.667.png'; 
        };

        if (activeBgMode === 'custom' && customBgUrl) {
            const userImg = new Image();
            userImg.onload = function() {
                const imgRatio = userImg.width / userImg.height;
                const canvasRatio = canvas.width / canvas.height;
                let renderW, renderH, offsetX = 0, offsetY = 0;
                
                if (imgRatio < canvasRatio) {
                    renderW = canvas.width;
                    renderH = canvas.width / imgRatio;
                    offsetY = (canvas.height - renderH) / 2;
                } else {
                    renderH = canvas.height;
                    renderW = canvas.height * imgRatio;
                    offsetX = (canvas.width - renderW) / 2;
                }
                
                ctx.clearRect(0, 0, canvas.width, canvas.height);
                ctx.drawImage(userImg, offsetX, offsetY, renderW, renderH);
                
                drawOverlaysAndUI(); 
            };
            userImg.onerror = function() {
                ctx.fillStyle = "#f3e8ff"; 
                ctx.fillRect(0, 0, canvas.width, canvas.height);
                drawOverlaysAndUI();
            };
            userImg.src = customBgUrl;

        } else {
            // โหมด "ใช้พื้นหลังระบบ"
            if (bgSelect && bgSelect !== currentBgSrc) {
                cachedBgImage.onload = () => {
                    currentBgSrc = bgSelect;
                    ctx.clearRect(0, 0, canvas.width, canvas.height);
                    ctx.drawImage(cachedBgImage, 0, 0, canvas.width, canvas.height);
                    drawUI(); 
                };
                cachedBgImage.onerror = () => {
                    drawUI();
                };
                cachedBgImage.src = bgSelect;
            } else {
                if (cachedBgImage.complete && cachedBgImage.src) {
                    ctx.clearRect(0, 0, canvas.width, canvas.height);
                    ctx.drawImage(cachedBgImage, 0, 0, canvas.width, canvas.height);
                } else {
                    ctx.fillStyle = "#f3e8ff";
                    ctx.fillRect(0, 0, canvas.width, canvas.height);
                }
                drawUI(); 
            }
        }
    };

    function drawText(ctx, text, x, y, fontSize, fontFamily, color, align, lineHeight, maxLines, shadowColor, shadowBlur, maxWidth, letterSpacing) {
        ctx.font = `${fontSize}px "${fontFamily}", sans-serif`;
        ctx.fillStyle = color;
        ctx.textAlign = 'left';
        ctx.shadowColor = shadowColor || 'transparent';
        ctx.shadowBlur = shadowBlur || 0;

        const safeText = String(text || '');
        const paragraphs = safeText.split('<br>');
        let currentY = y;

        paragraphs.forEach(paragraph => {
            const segmenter = new Intl.Segmenter('th', { granularity: 'word' });
            const words = [...segmenter.segment(paragraph)].map(s => s.segment);
            let lines = [], currentLine = '';

            words.forEach(word => {
                const testLine = currentLine + word;
                const testWidth = ctx.measureText(testLine).width + (testLine.length - 1) * letterSpacing;
                if (testWidth > maxWidth && currentLine !== '') {
                    lines.push(currentLine);
                    currentLine = word;
                } else {
                    currentLine = testLine;
                }
            });
            if (currentLine) lines.push(currentLine.trimStart());

            lines.forEach((line, index) => {
                let currentX = x;
                if (align === 'center') currentX = x - (ctx.measureText(line).width / 2) - ((line.length - 1) * letterSpacing) / 2;
                else if (align === 'right') currentX = x - ctx.measureText(line).width - ((line.length - 1) * letterSpacing);
                
                drawTextLine(ctx, line, currentX, currentY, letterSpacing);
                currentY += lineHeight;
                if (maxLines && index >= maxLines - 1) return;
            });
            currentY += lineHeight;
        });
    }

    function drawTextLine(ctx, text, x, y, letterSpacing) {
        if (!letterSpacing) {
            ctx.fillText(text, x, y);
            return;
        }

        const characters = [...(new Intl.Segmenter('th', { granularity: 'grapheme' })).segment(String(text))].map(s => s.segment);
        let currentX = x;

        characters.forEach((char, index) => {
            const code = char.charCodeAt(0);
            const prevChar = index > 0 ? characters[index - 1].charCodeAt(0) : null;

            let yOff = 0, xOff = 0;
            if (code >= 0x0E34 && code <= 0x0E37) yOff = -1;
            if (code >= 0x0E48 && code <= 0x0E4C) {
                if (prevChar && ((prevChar >= 0x0E34 && prevChar <= 0x0E37) || prevChar === 0x0E31)) yOff = -8;
                else xOff = -7;
            }
            if (code === 0x0E31) { yOff = -1; xOff = 1; }
            if (code >= 0x0E38 && code <= 0x0E3A) { xOff = -10; }

            ctx.fillText(char, currentX + xOff, y + yOff);

            if (![0x0E48,0x0E49,0x0E4A,0x0E4B,0x0E4C,0x0E31,0x0E34,0x0E35,0x0E36,0x0E37,0x0E38,0x0E39,0x0E3A].includes(code)) {
                currentX += ctx.measureText(char).width + letterSpacing;
            } else {
                currentX += ctx.measureText(char).width;
            }
        });
    }

    function drawBattery(ctx, batteryLevel, powerSavingMode) {
        ctx.lineWidth = 2; 
        ctx.strokeStyle = '#9b9b9b'; 
        ctx.fillStyle = '#ffffff'; 

        let batteryColor = '#ffffff'; 
        if (batteryLevel <= 20) batteryColor = '#ff0000'; 
        else if (powerSavingMode) batteryColor = '#fccd0e'; 

        const fillWidth = (batteryLevel / 100) * 32.5; 
        const x = 511.5, y = 32.4, height = 13.8, radius = 4; 

        ctx.fillStyle = batteryColor; 
        ctx.beginPath(); 
        ctx.moveTo(x, y + radius); 
        ctx.lineTo(x, y + height - radius); 
        ctx.arcTo(x, y + height, x + radius, y + height, radius); 
        ctx.lineTo(x + fillWidth - radius, y + height); 
        ctx.arcTo(x + fillWidth, y + height, x + fillWidth, y + height - radius, radius); 
        ctx.lineTo(x + fillWidth, y + radius); 
        ctx.arcTo(x + fillWidth, y, x + fillWidth - radius, y, radius); 
        ctx.lineTo(x + radius, y); 
        ctx.arcTo(x, y, x, y + radius, radius); 
        ctx.closePath(); 
        ctx.fill(); 
    }

    window.addEventListener('DOMContentLoaded', () => {
        loadFonts().then(() => {
            document.fonts.ready.then(() => {
                if (typeof window.updateDisplay === 'function') window.updateDisplay();
            });
        }).catch(() => {
            if (typeof window.updateDisplay === 'function') window.updateDisplay();
        });
    });

})();
