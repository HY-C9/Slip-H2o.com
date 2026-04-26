function loadFonts() {
    const fonts = [
        new FontFace('SFThonburiSemiBold', 'url(assets/fonts/SFThonburi-Semibold.woff)'),
        new FontFace('KanitLight', 'url(assets/fonts/Kanit-Light.woff)'),
        new FontFace('KanitRegular', 'url(assets/fonts/Kanit-Regular.woff)'),
        new FontFace('KanitMedium', 'url(assets/fonts/Kanit-Medium.woff)')
    ];

    return Promise.allSettled(fonts.map(font => font.load())).then(function(loadedFonts) {
        loadedFonts.forEach(function(result) {
            if (result.status === 'fulfilled') {
                document.fonts.add(result.value);
            }
        });
    });
}

window.onload = function() {
    setCurrentDateTime();
    updateMonthAndYear(); 

    loadFonts().then(function() {
        document.fonts.ready.then(function() {
            updateDisplay(); 
        });
    }).catch(function() {
        updateDisplay();
    });
};

function setCurrentDateTime() {
    const now = new Date();
    const hours = padZero(now.getHours());
    const minutes = padZero(now.getMinutes());
    const dt = document.getElementById('datetime');
    if(dt) dt.value = `${hours}:${minutes}`;
}

function padZero(number) {
    return number < 10 ? '0' + number : number;
}

function updateMonthAndYear() {
    const today = new Date();
    const fullThaiMonths = ['ม.ค.', 'ก.พ.', 'มี.ค.', 'เม.ย.', 'พ.ค.', 'มิ.ย.', 'ก.ค.', 'ส.ค.', 'ก.ย.', 'ต.ค.', 'พ.ย.', 'ธ.ค.'];
    const day = today.getDate(); 
    const fullMonth = fullThaiMonths[today.getMonth()]; 
    const year = today.getFullYear() + 543; 
    
    const monthMonthYear = `${day} ${fullMonth} ${year % 100}`;
    const mInput = document.getElementById('monthmonthyear');
    if(mInput) mInput.value = monthMonthYear;
}

function formatDate(date) {
    const options = { day: 'numeric', month: 'short', year: '2-digit' };
    let formattedDate = new Date(date).toLocaleDateString('th-TH', options);
    formattedDate = formattedDate.replace(/ /g, ' ').replace(/\./g, '');
    const months = ['ม.ค.', 'ก.พ.', 'มี.ค.', 'เม.ย.', 'พ.ค.', 'มิ.ย.', 'ก.ค.', 'ส.ค.', 'ก.ย.', 'ต.ค.', 'พ.ย.', 'ธ.ค.'];
    const day = padZero(formattedDate.split(' ')[0]);
    const month = months[new Date(date).getMonth()];
    const year = formattedDate.split(' ')[2];
    return `${day} ${month} ${year}`;
}

let qrCodeImage = null;
let powerSavingMode = false;

window.handlePaste = function(event) {
    const items = event.clipboardData.items;
    for (let i = 0; i < items.length; i++) {
        if (items[i].type.indexOf('image') !== -1) {
            const blob = items[i].getAsFile();
            const reader = new FileReader();
            reader.onload = function(event) {
                const img = new Image();
                img.onload = function() {
                    qrCodeImage = img;
                    updateDisplay();
                };
                img.src = event.target.result;
            };
            reader.readAsDataURL(blob);
        }
    }
}

window.updateDisplay = function() {
    const datetime = document.getElementById('datetime')?.value || '-';
    const batteryLevel = document.getElementById('battery')?.value || '100';
    const monthmonthyear = document.getElementById('monthmonthyear')?.value || '-';
    const money01 = document.getElementById('money01')?.value || '-';
    
    const choose1 = document.getElementById('choose1')?.value || '-';
    let money1 = document.getElementById('money1')?.value || '-';
    const time1 = document.getElementById('time1')?.value || '-';

    const choose2 = document.getElementById('choose2')?.value || '-';
    let money2 = document.getElementById('money2')?.value || '-';
    const time2 = document.getElementById('time2')?.value || '-';
    const remaining2 = document.getElementById('remaining2')?.value || '-';
    
    const choose3 = document.getElementById('choose3')?.value || '-';
    let money3 = document.getElementById('money3')?.value || '-';
    
    if (choose1 === 'ถอนเงิน' && !money1.startsWith('-')) {
        money1 = money1.startsWith('+') ? '-' + money1.substring(1) : '-' + money1;
    } else if (choose1 === 'รับเงินโอน' && !money1.startsWith('+')) {
        money1 = money1.startsWith('-') ? '+' + money1.substring(1) : '+' + money1;
    }
    const m1Input = document.getElementById('money1');
    if(m1Input) m1Input.value = money1;

    if (choose2 === 'ถอนเงิน' && !money2.startsWith('-')) {
        money2 = money2.startsWith('+') ? '-' + money2.substring(1) : '-' + money2;
    } else if (choose2 === 'รับเงินโอน' && !money2.startsWith('+')) {
        money2 = money2.startsWith('-') ? '+' + money2.substring(1) : '+' + money2;
    }
    const m2Input = document.getElementById('money2');
    if(m2Input) m2Input.value = money2;

    if (choose3 === 'ถอนเงิน' && !money3.startsWith('-')) {
        money3 = money3.startsWith('+') ? '-' + money3.substring(1) : '-' + money3;
    } else if (choose3 === 'รับเงินโอน' && !money3.startsWith('+')) {
        money3 = money3.startsWith('-') ? '+' + money3.substring(1) : '+' + money3;
    }
    const m3Input = document.getElementById('money3');
    if(m3Input) m3Input.value = money3;

    const canvas = document.getElementById('canvas');
    if(!canvas) return;
    const ctx = canvas.getContext('2d');

    const drawAllContent = (bgImg) => {
        ctx.clearRect(0, 0, canvas.width, canvas.height);

        if(bgImg) {
            ctx.drawImage(bgImg, 0, 0, canvas.width, canvas.height);
        } else {
            ctx.fillStyle = '#f5f5f5';
            ctx.fillRect(0, 0, canvas.width, canvas.height);
            ctx.fillStyle = '#ff6b6b';
            ctx.font = '20px Kanit, sans-serif';
            ctx.textAlign = 'center';
            ctx.fillText('❌ หาภาพพื้นหลังไม่เจอ', canvas.width / 2, canvas.height / 2 - 20);
            ctx.fillStyle = '#6366f1';
            ctx.font = '16px Kanit, sans-serif';
            ctx.fillText('ตรวจสอบไฟล์: assets/image/bs/DepositKKP.jpg', canvas.width / 2, canvas.height / 2 + 10);
        }

        drawText(ctx, `${datetime}`, 63.4, 45.8, 22.50, 'SFThonburiSemiBold', '#000000', 'left', 1.5, 3, 0, 0, 800, 0);
        
        let textColor1 = choose1 === 'ถอนเงิน' ? '#ac4b4b' : '#0d7954';
        let textColor2 = choose2 === 'ถอนเงิน' ? '#ac4b4b' : '#0d7954';
        let textColor3 = choose3 === 'ถอนเงิน' ? '#ac4b4b' : '#0d7954';

        drawText(ctx, `${money01}`, 85.5, 185.6, 33, 'KanitRegular', '#ffffff', 'left', 1.5, 3, 0, 0, 500, 0);
        drawText(ctx, `THB`, 85.5 + ctx.measureText(`${money01}`).width + 15, 185.6, 19, 'KanitLight', '#afa3c7', 'left', 1.5, 3, 0, 0, 500, 0);

        drawText(ctx, `ข้อมูล ณ วันที่ ${monthmonthyear}`, 61.6, 574, 18.5, 'KanitRegular', '#acabb0', 'left', 1.5, 3, 0, 0, 800, 0);
       
        drawText(ctx, `${choose1}`, 159.7, 814.8, 17.5, 'KanitMedium', '#47406c', 'left', 1.5, 3, 0, 0, 800, 0);
        drawText(ctx, `${money1} THB`, 490.5, 814.8, 19.5, 'KanitMedium', textColor1, 'right', 1.5, 3, 0, 0, 800, 0);
        drawText(ctx, `${time1} น.`, 159.7, 842.2, 18.5, 'KanitRegular', '#acabb0', 'left', 1.5, 3, 0, 0, 800, 0);
        drawText(ctx, `คงเหลือ ${money01} THB`, 490.5, 842.2, 18.5, 'KanitRegular', '#acabb0', 'right', 1.5, 3, 0, 0, 800, 0);

        drawText(ctx, `${choose2}`, 159.7, 910, 17.5, 'KanitMedium', '#47406c', 'left', 1.5, 3, 0, 0, 800, 0);
        drawText(ctx, `${money2} THB`, 490.5, 910, 19.5, 'KanitMedium', textColor2, 'right', 1.5, 3, 0, 0, 800, 0);
        drawText(ctx, `${time2} น.`, 159.7, 938.2, 18.5, 'KanitRegular', '#acabb0', 'left', 1.5, 3, 0, 0, 800, 0);
        drawText(ctx, `คงเหลือ ${remaining2} THB`, 490.5, 938.2, 18.5, 'KanitRegular', '#acabb0', 'right', 1.5, 3, 0, 0, 800, 0);

        drawText(ctx, `${choose3}`, 159.7, 1006.2, 17.5, 'KanitMedium', '#47406c', 'left', 1.5, 3, 0, 0, 800, 0);
        drawText(ctx, `${money3} THB`, 490.5, 1006.2, 19.5, 'KanitMedium', textColor3, 'right', 1.5, 3, 0, 0, 800, 0);

        if (qrCodeImage) {
            ctx.drawImage(qrCodeImage, 0, 130.3, 555, 951);
        }

        drawBattery(ctx, batteryLevel, powerSavingMode);
    };

    const backgroundImage = new Image();
    backgroundImage.src = 'assets/image/bs/DepositKKP.jpg';
    
    backgroundImage.onload = function() {
        drawAllContent(backgroundImage);
    };

    backgroundImage.onerror = function() {
        drawAllContent(null);
    }
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
            if (maxLines && index >= maxLines - 1) {
                return;
            }
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

        if (isUpperVowel) {
            yOffset = -1;
            xOffset = 0;
        }

        if (isToneMark) {
            if (prevChar && ((prevChar.charCodeAt(0) >= 0x0E34 && prevChar.charCodeAt(0) <= 0x0E37) || prevChar.charCodeAt(0) === 0x0E31)) {
                yOffset = -8;
                xOffset = 0;
            } else {
                yOffset = 0;
                xOffset = -7;
            }
        }

        if (isBeforeVowel) {
            yOffset = -1;
            xOffset = 1;
        }

        if (isBelowVowel) {
            yOffset = 0;
            xOffset = -10;
        }

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

    let batteryColor = '#000000'; 
    if (batteryLevel <= 20) {
        batteryColor = '#ff0000'; 
    } else if (powerSavingMode) {
        batteryColor = '#fccd0e'; 
    }

    const fillWidth = (batteryLevel / 100) * 29.4; 
    const x = 482.25;
    const y = 30.2;
    const height = 12.8;
    const radius = 4; 

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

window.togglePowerSavingMode = function() {
    powerSavingMode = !powerSavingMode;
    const powerSavingButton = document.getElementById('powerSavingMode');
    if(powerSavingButton) powerSavingButton.classList.toggle('active', powerSavingMode);
    updateDisplay();
}

window.updateBatteryDisplay = function() {
    const batteryLevel = document.getElementById('battery')?.value || '100';
    const bl = document.getElementById('battery-level');
    if(bl) bl.innerText = batteryLevel;
}

window.downloadImage = function() {
    const canvas = document.getElementById('canvas');
    if(!canvas) return;
    const link = document.createElement('a');
    link.href = canvas.toDataURL('image/png');
    link.download = 'slip_kkp.png';
    link.click();
}

const genBtn = document.getElementById('generate');
if(genBtn) {
    genBtn.addEventListener('click', updateDisplay);
}

function drawImage(ctx, imageUrl, x, y, width, height) {
    const image = new Image();
    image.src = imageUrl;
    image.onload = function() {
        ctx.drawImage(image, x, y, width, height);
    };
}