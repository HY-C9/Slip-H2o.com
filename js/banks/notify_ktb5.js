(function() {
    let powerSavingMode = false;
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
            results.forEach((result, index) => {
                if (result.status === 'fulfilled') {
                    document.fonts.add(result.value);
                }
            });
        });
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
        const months = ['ม.ค.', 'ก.พ.', 'มี.ค.', 'เม.ย.', 'พ.ค.', 'มิ.ย.', 'ก.ค.', 'ส.ค.', 'ก.ย.', 'ต.ค.', 'พ.ย.', 'ธ.ค.'];
        const year = (d.getFullYear() + 543).toString().slice(-2);
        return `${d.getDate()} ${months[d.getMonth()]} ${year}`;
    }

    function getTimeAgoMessage(baseTime, compareTime) {
        if (!baseTime || !compareTime) return "ตอนนี้";
        const baseDate = new Date(`1970-01-01T${baseTime}:00Z`);
        const compDate = new Date(`1970-01-01T${compareTime}:00Z`);
        const diffMins = Math.floor((baseDate - compDate) / 60000);

        if (diffMins >= 60) return `${Math.floor(diffMins / 60)} ชั่วโมงที่แล้ว`;
        if (diffMins > 1) return `${diffMins} นาทีที่แล้ว`;
        if (diffMins === 1) return "1 นาทีที่แล้ว";
        return "ตอนนี้";
    }

    function drawCanvasContent(ctx, canvas, data) {
        ctx.clearRect(0, 0, canvas.width, canvas.height);
        
        const activeBgMode = document.getElementById('activeBgMode')?.value || 'system';
        const customBgUrl = document.getElementById('customImageDataUrl')?.value || '';

        // ฟังก์ชันวาดเฉพาะข้อความและแบตเตอรี่ (ไม่ต้องมีกรอบ 666, 667)
        const drawUI = () => {
            drawText(ctx, `   ${data.formattedDateWithDay}   `, 308, 167.8, 33.50, 'SFThonburiSemiBold', '#ffffff', 'center', 24, 3, 0, 0, 800, 0);
            drawText(ctx, `${data.formattedTimePlusOne}`, 295, 298.8, 138.50, 'SFThonburiSemiBold', '#ffffff', 'center', 1.5, 3, 0, 0, 800, -7);

            drawText(ctx, `รายการเงินเข้า`, 107.8, 451.8, 21.50, 'SFThonburiBold', '#000000', 'left', 1.5, 3, 0, 0, 800, 0);
            drawText(ctx, `${data.timeMsg1}`, 547.5, 451.8, 18.50, 'SFThonburiRegular', '#6f8590', 'right', 1.5, 3, 0, 0, 800, 0);
            drawText(ctx, `บัญชี ${data.senderaccount1} จำนวนเงิน ${data.money01} บาท วันที่ ${data.formattedDate} ${data.formattedTime} น.<br>`, 107.8, 481.8, 20.50, 'SFThonburiRegular', '#000000', 'left', 31.5, 3, 0, 0, 420, 0);

            drawText(ctx, `รายการเงินเข้า`, 107.8, 588, 21.50, 'SFThonburiBold', '#000000', 'left', 1.5, 3, 0, 0, 800, 0);
            drawText(ctx, `${data.timeMsg2}`, 547.5, 588, 18.50, 'SFThonburiRegular', '#6f8590', 'right', 1.5, 3, 0, 0, 800, 0);
            drawText(ctx, `บัญชี ${data.senderaccount1} จำนวนเงิน ${data.money02} บาท วันที่ ${data.formattedDate} ${data.formattedTime1} น.<br>`, 107.8, 617.8, 20.50, 'SFThonburiRegular', '#000000', 'left', 31.5, 3, 0, 0, 420, 0);

            drawBattery(ctx, data.batteryLevel, powerSavingMode);
        };

        // ฟังก์ชันวาดกรอบ 666, 667 แล้วค่อยเรียก drawUI (ใช้เฉพาะโหมดวางรูปเอง)
        const drawOverlaysAndUI = () => {
            let loadedCount = 0;
            const img1 = new Image();
            const img2 = new Image();
            let img1Success = false, img2Success = false;

            const checkAndDrawText = () => {
                loadedCount++;
                if (loadedCount === 2) {
                    if (img1Success) {
                        ctx.globalAlpha = 0.80; 
                        ctx.drawImage(img1, 0, 0, canvas.width, canvas.height);
                        ctx.globalAlpha = 1.0; 
                    }
                    if (img2Success) {
                        ctx.drawImage(img2, 0, 0, canvas.width, canvas.height);
                    }
                    
                    // หลังจากวาดกรอบเสร็จ ค่อยวาดข้อความทับลงไป
                    drawUI();
                }
            };

            img1.onload = () => { img1Success = true; checkAndDrawText(); };
            img1.onerror = () => { checkAndDrawText(); };
            img1.src = 'assets/image/bs/backgroundEnter-KB4.666.png';

            img2.onload = () => { img2Success = true; checkAndDrawText(); };
            img2.onerror = () => { checkAndDrawText(); };
            img2.src = 'assets/image/bs/backgroundEnter-KB4.667.png';
        };

        // --- เช็คเงื่อนไขว่าใช้รูปพื้นหลังแบบไหน ---
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
                
                ctx.drawImage(userImg, offsetX, offsetY, renderW, renderH);
                
                // ใช้รูปวางเอง -> เรียกใช้วาดกรอบ 666, 667 + ข้อความ
                drawOverlaysAndUI(); 
            };
            userImg.onerror = function() {
                ctx.fillStyle = "#1e293b";
                ctx.fillRect(0, 0, canvas.width, canvas.height);
                drawOverlaysAndUI();
            };
            userImg.src = customBgUrl;
        } else {
            if (cachedBgImage.src) {
                ctx.drawImage(cachedBgImage, 0, 0, canvas.width, canvas.height);
            } else {
                ctx.fillStyle = "#1e293b";
                ctx.fillRect(0, 0, canvas.width, canvas.height);
            }
            
            // ใช้รูปจากระบบ (ไม่มีการวางรูปเอง) -> วาดแค่ข้อความอย่างเดียว ไม่เอากรอบ
            drawUI(); 
        }
    }

    window.updateDisplay = function() {
        const canvas = document.getElementById('canvas');
        if (!canvas) return;
        const ctx = canvas.getContext('2d');

        const activeBgMode = document.getElementById('activeBgMode')?.value || 'system';
        const bgSelect = document.getElementById('backgroundSelect')?.value || '';
        const datetime = document.getElementById('datetime')?.value || '-';
        const datetime1 = document.getElementById('datetime1')?.value || '-';
        const datetimePlusOne = document.getElementById('datetime_plus_one')?.value || '-';
        
        const data = {
            batteryLevel: document.getElementById('battery')?.value || '100',
            money01: document.getElementById('money01')?.value || '-',
            money02: document.getElementById('money02')?.value || '-',
            senderaccount1: document.getElementById('senderaccount1')?.value || '-',
            formattedDate: formatDate(datetime.substring(0, 10)),
            formattedDateWithDay: formatDateWithDay(datetime.substring(0, 10)),
            formattedTime: datetime.length > 11 ? datetime.substring(11, 16) : '-',
            formattedTime1: datetime1.length > 11 ? datetime1.substring(11, 16) : '-',
            formattedTimePlusOne: datetimePlusOne
        };

        data.timeMsg1 = getTimeAgoMessage(data.formattedTimePlusOne, data.formattedTime);
        data.timeMsg2 = getTimeAgoMessage(data.formattedTimePlusOne, data.formattedTime1);

        if (activeBgMode === 'system' && bgSelect && bgSelect !== currentBgSrc) {
            cachedBgImage.onload = () => {
                currentBgSrc = bgSelect;
                drawCanvasContent(ctx, canvas, data);
            };
            cachedBgImage.onerror = () => {
                drawCanvasContent(ctx, canvas, data);
            };
            cachedBgImage.src = bgSelect;
        } else {
            drawCanvasContent(ctx, canvas, data);
        }
    };

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

            let yOffset = 0, xOffset = 0;

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

    function drawBattery(ctx, batteryLevel, powerSavingMode) {
        ctx.lineWidth = 2; 
        ctx.strokeStyle = '#9b9b9b'; 
        ctx.fillStyle = '#ffffff'; 

        let batteryColor = '#ffffff'; 
        if (batteryLevel <= 20) {
            batteryColor = '#ff0000'; 
        } else if (powerSavingMode) {
            batteryColor = '#fccd0e'; 
        }

        const fillWidth = (batteryLevel / 100) * 31; 
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

    window.downloadImage = function() {
        const canvas = document.getElementById('canvas');
        if(!canvas) return;
        const link = document.createElement('a');
        link.href = canvas.toDataURL('image/png');
        link.download = 'notify_kbank4.png'; 
        link.click();
    };

    window.addEventListener('paste', function(e) {
        if(document.activeElement.tagName === 'INPUT') return; 

        const items = (e.clipboardData || e.originalEvent.clipboardData).items;
        for (let index in items) {
            const item = items[index];
            if (item.kind === 'file' && item.type.startsWith('image/')) {
                const blob = item.getAsFile();
                const reader = new FileReader();
                reader.onload = function(event) {
                    document.getElementById('customImageDataUrl').value = event.target.result;
                    if(window.activateCustomMode) window.activateCustomMode();

                    const dropZone = document.getElementById('pasteDropZone');
                    if (dropZone) {
                        const originalBg = dropZone.style.background;
                        const originalBorder = dropZone.style.borderColor;
                        dropZone.style.background = 'rgba(0, 169, 80, 0.2)';
                        dropZone.style.borderColor = '#00a950';
                        setTimeout(() => {
                            dropZone.style.background = originalBg;
                            dropZone.style.borderColor = originalBorder;
                        }, 400);
                    }
                };
                reader.readAsDataURL(blob);
                e.preventDefault();
                break;
            }
        }
    });

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
