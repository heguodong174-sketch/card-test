// 个人卡片生成器 JavaScript
class CardGenerator {
    constructor() {
        this.cardData = {
            avatar: null,
            name: '',
            title: '',
            company: '',
            email: '',
            phone: '',
            address: '',
            website: '',
            social: '',
            bio: ''
        };
        this.cardStyle = 'business';
        this.colorScheme = 'business';
        this.cardSize = 'standard';
        this.cropper = null;

        this.init();
    }

    init() {
        this.bindEvents();
        this.updateCard();
        this.loadSavedData();
    }

    bindEvents() {
        // 头像上传相关
        document.getElementById('uploadBtn').addEventListener('click', () => {
            document.getElementById('avatarInput').click();
        });

        document.getElementById('avatarInput').addEventListener('change', (e) => {
            this.handleAvatarUpload(e);
        });

        document.getElementById('avatarPreview').addEventListener('click', () => {
            document.getElementById('avatarInput').click();
        });

        // 裁剪模态框相关
        document.getElementById('closeCropModal').addEventListener('click', () => {
            this.closeCropModal();
        });

        document.getElementById('cancelCrop').addEventListener('click', () => {
            this.closeCropModal();
        });

        document.getElementById('confirmCrop').addEventListener('click', () => {
            this.confirmCrop();
        });

        // 表单字段监听
        const formFields = ['name', 'title', 'company', 'email', 'phone', 'address', 'website', 'social', 'bio'];
        formFields.forEach(field => {
            const element = document.getElementById(field);
            if (element) {
                element.addEventListener('input', (e) => {
                    this.cardData[field] = e.target.value;
                    this.updateCard();
                    this.saveData();
                });
            }
        });

        // 样式选择监听
        document.getElementById('cardStyle').addEventListener('change', (e) => {
            this.cardStyle = e.target.value;
            this.updateCard();
            this.saveData();
        });

        document.getElementById('colorScheme').addEventListener('change', (e) => {
            this.colorScheme = e.target.value;
            this.updateCard();
            this.saveData();
        });

        document.getElementById('cardSize').addEventListener('change', (e) => {
            this.cardSize = e.target.value;
            this.updateCard();
            this.saveData();
        });

        // 下载按钮
        document.getElementById('downloadPNG').addEventListener('click', () => {
            this.downloadCard('png');
        });

        document.getElementById('downloadJPG').addEventListener('click', () => {
            this.downloadCard('jpg');
        });

        // 重置按钮
        document.getElementById('resetBtn').addEventListener('click', () => {
            this.resetAll();
        });

        // 点击模态框外部关闭
        window.addEventListener('click', (e) => {
            const modal = document.getElementById('cropModal');
            if (e.target === modal) {
                this.closeCropModal();
            }
        });
    }

    handleAvatarUpload(event) {
        const file = event.target.files[0];
        if (file && file.type.startsWith('image/')) {
            const reader = new FileReader();
            reader.onload = (e) => {
                this.showCropModal(e.target.result);
            };
            reader.readAsDataURL(file);
        }
    }

    showCropModal(imageSrc) {
        const modal = document.getElementById('cropModal');
        const cropImage = document.getElementById('cropImage');

        cropImage.src = imageSrc;
        modal.style.display = 'block';

        // 等待图片加载完成后初始化Cropper
        cropImage.onload = () => {
            if (this.cropper) {
                this.cropper.destroy();
            }

            this.cropper = new Cropper(cropImage, {
                aspectRatio: 1,
                viewMode: 1,
                guides: true,
                center: true,
                highlight: true,
                background: true,
                autoCropArea: 0.8,
                responsive: true,
                checkCrossOrigin: true
            });
        };
    }

    closeCropModal() {
        const modal = document.getElementById('cropModal');
        modal.style.display = 'none';

        if (this.cropper) {
            this.cropper.destroy();
            this.cropper = null;
        }

        // 清空文件输入
        document.getElementById('avatarInput').value = '';
    }

    confirmCrop() {
        if (this.cropper) {
            const canvas = this.cropper.getCroppedCanvas({
                width: 300,
                height: 300,
                imageSmoothingEnabled: true,
                imageSmoothingQuality: 'high'
            });

            const croppedImage = canvas.toDataURL('image/jpeg', 0.9);
            this.cardData.avatar = croppedImage;
            this.updateAvatarPreview(croppedImage);
            this.updateCard();
            this.saveData();
            this.closeCropModal();
        }
    }

    updateAvatarPreview(imageSrc) {
        const preview = document.getElementById('avatarPreview');
        preview.innerHTML = `<img src="${imageSrc}" alt="头像">`;
    }

    updateCard() {
        const card = document.getElementById('businessCard');

        // 更新样式类
        card.className = `business-card ${this.cardStyle}-style ${this.colorScheme}-color ${this.cardSize}-size`;

        // 生成卡片内容
        const cardContent = this.generateCardContent();
        card.innerHTML = cardContent;
    }

    generateCardContent() {
        const hasAvatar = this.cardData.avatar;
        const hasInfo = this.cardData.name || this.cardData.title || this.cardData.company;

        let content = '<div class="card-content">';

        // 头像部分
        if (hasAvatar || true) { // 始终显示头像区域
            content += '<div class="card-avatar">';
            if (this.cardData.avatar) {
                content += `<img src="${this.cardData.avatar}" alt="${this.cardData.name || '头像'}">`;
            } else {
                // 默认头像占位符
                content += '<div style="width: 100%; height: 100%; background: linear-gradient(135deg, #667eea, #764ba2); display: flex; align-items: center; justify-content: center; color: white; font-size: 48px; font-weight: bold;">' +
                          (this.cardData.name ? this.cardData.name.charAt(0).toUpperCase() : '?') + '</div>';
            }
            content += '</div>';
        }

        // 信息部分
        content += '<div class="card-info">';

        // 姓名
        if (this.cardData.name) {
            content += `<div class="card-name">${this.escapeHtml(this.cardData.name)}</div>`;
        }

        // 职位
        if (this.cardData.title) {
            content += `<div class="card-title">${this.escapeHtml(this.cardData.title)}</div>`;
        }

        // 公司
        if (this.cardData.company) {
            content += `<div class="card-company">${this.escapeHtml(this.cardData.company)}</div>`;
        }

        // 个人简介
        if (this.cardData.bio) {
            content += `<div class="card-bio">${this.escapeHtml(this.cardData.bio)}</div>`;
        }

        // 联系方式
        const contactItems = [];

        if (this.cardData.email) {
            contactItems.push(`
                <div class="contact-item">
                    <span class="contact-icon">📧</span>
                    <span>${this.escapeHtml(this.cardData.email)}</span>
                </div>
            `);
        }

        if (this.cardData.phone) {
            contactItems.push(`
                <div class="contact-item">
                    <span class="contact-icon">📱</span>
                    <span>${this.escapeHtml(this.cardData.phone)}</span>
                </div>
            `);
        }

        if (this.cardData.address) {
            contactItems.push(`
                <div class="contact-item">
                    <span class="contact-icon">📍</span>
                    <span>${this.escapeHtml(this.cardData.address)}</span>
                </div>
            `);
        }

        if (this.cardData.website) {
            contactItems.push(`
                <div class="contact-item">
                    <span class="contact-icon">🌐</span>
                    <span>${this.escapeHtml(this.cardData.website)}</span>
                </div>
            `);
        }

        if (this.cardData.social) {
            contactItems.push(`
                <div class="contact-item">
                    <span class="contact-icon">💬</span>
                    <span>${this.escapeHtml(this.cardData.social)}</span>
                </div>
            `);
        }

        if (contactItems.length > 0) {
            content += '<div class="card-contact">' + contactItems.join('') + '</div>';
        }

        content += '</div>'; // card-info
        content += '</div>'; // card-content

        return content;
    }

    escapeHtml(text) {
        const div = document.createElement('div');
        div.textContent = text;
        return div.innerHTML;
    }

    async downloadCard(format) {
        const card = document.getElementById('businessCard');

        try {
            // 显示加载提示
            const downloadBtn = format === 'png' ?
                document.getElementById('downloadPNG') :
                document.getElementById('downloadJPG');
            const originalText = downloadBtn.textContent;
            downloadBtn.textContent = '生成中...';
            downloadBtn.disabled = true;

            // 配置html2canvas选项
            const canvas = await html2canvas(card, {
                backgroundColor: null,
                scale: 2, // 提高分辨率
                useCORS: true,
                allowTaint: true,
                logging: false,
                width: card.offsetWidth,
                height: card.offsetHeight
            });

            // 转换为指定格式
            const mimeType = format === 'jpg' ? 'image/jpeg' : 'image/png';
            const quality = format === 'jpg' ? 0.9 : 1.0;
            const dataURL = canvas.toDataURL(mimeType, quality);

            // 下载文件
            const fileName = `${this.cardData.name || '个人卡片'}_${Date.now()}.${format}`;
            this.downloadFile(dataURL, fileName);

            // 恢复按钮状态
            downloadBtn.textContent = originalText;
            downloadBtn.disabled = false;

        } catch (error) {
            console.error('下载失败:', error);
            alert('下载失败，请重试');

            // 恢复按钮状态
            const downloadBtn = format === 'png' ?
                document.getElementById('downloadPNG') :
                document.getElementById('downloadJPG');
            downloadBtn.textContent = originalText;
            downloadBtn.disabled = false;
        }
    }

    downloadFile(dataURL, fileName) {
        const link = document.createElement('a');
        link.href = dataURL;
        link.download = fileName;
        link.style.display = 'none';
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
    }

    resetAll() {
        if (confirm('确定要重置所有内容吗？这将清除所有已填写的信息。')) {
            // 清空数据
            this.cardData = {
                avatar: null,
                name: '',
                title: '',
                company: '',
                email: '',
                phone: '',
                address: '',
                website: '',
                social: '',
                bio: ''
            };

            this.cardStyle = 'business';
            this.colorScheme = 'business';
            this.cardSize = 'standard';

            // 重置表单
            document.getElementById('name').value = '';
            document.getElementById('title').value = '';
            document.getElementById('company').value = '';
            document.getElementById('email').value = '';
            document.getElementById('phone').value = '';
            document.getElementById('address').value = '';
            document.getElementById('website').value = '';
            document.getElementById('social').value = '';
            document.getElementById('bio').value = '';
            document.getElementById('cardStyle').value = 'business';
            document.getElementById('colorScheme').value = 'business';
            document.getElementById('cardSize').value = 'standard';

            // 重置头像预览
            document.getElementById('avatarPreview').innerHTML = `
                <div class="avatar-placeholder">
                    <span>📷</span>
                    <p>点击上传头像</p>
                </div>
            `;

            // 清除本地存储
            localStorage.removeItem('cardGeneratorData');

            // 更新卡片
            this.updateCard();

            // 显示成功提示
            this.showToast('已重置所有内容');
        }
    }

    saveData() {
        const dataToSave = {
            cardData: this.cardData,
            cardStyle: this.cardStyle,
            colorScheme: this.colorScheme,
            cardSize: this.cardSize
        };

        try {
            localStorage.setItem('cardGeneratorData', JSON.stringify(dataToSave));
        } catch (error) {
            console.warn('保存数据失败:', error);
        }
    }

    loadSavedData() {
        try {
            const savedData = localStorage.getItem('cardGeneratorData');
            if (savedData) {
                const data = JSON.parse(savedData);

                // 恢复数据
                this.cardData = data.cardData || this.cardData;
                this.cardStyle = data.cardStyle || 'business';
                this.colorScheme = data.colorScheme || 'business';
                this.cardSize = data.cardSize || 'standard';

                // 恢复表单值
                document.getElementById('name').value = this.cardData.name || '';
                document.getElementById('title').value = this.cardData.title || '';
                document.getElementById('company').value = this.cardData.company || '';
                document.getElementById('email').value = this.cardData.email || '';
                document.getElementById('phone').value = this.cardData.phone || '';
                document.getElementById('address').value = this.cardData.address || '';
                document.getElementById('website').value = this.cardData.website || '';
                document.getElementById('social').value = this.cardData.social || '';
                document.getElementById('bio').value = this.cardData.bio || '';
                document.getElementById('cardStyle').value = this.cardStyle;
                document.getElementById('colorScheme').value = this.colorScheme;
                document.getElementById('cardSize').value = this.cardSize;

                // 恢复头像
                if (this.cardData.avatar) {
                    this.updateAvatarPreview(this.cardData.avatar);
                }

                // 更新卡片
                this.updateCard();
            }
        } catch (error) {
            console.warn('加载保存数据失败:', error);
        }
    }

    showToast(message) {
        // 创建toast元素
        const toast = document.createElement('div');
        toast.style.cssText = `
            position: fixed;
            top: 20px;
            left: 50%;
            transform: translateX(-50%);
            background: #28a745;
            color: white;
            padding: 12px 24px;
            border-radius: 6px;
            box-shadow: 0 4px 12px rgba(0,0,0,0.3);
            z-index: 9999;
            font-size: 14px;
            font-weight: 600;
            opacity: 0;
            transition: opacity 0.3s ease;
        `;
        toast.textContent = message;

        document.body.appendChild(toast);

        // 显示动画
        setTimeout(() => {
            toast.style.opacity = '1';
        }, 10);

        // 自动隐藏
        setTimeout(() => {
            toast.style.opacity = '0';
            setTimeout(() => {
                if (document.body.contains(toast)) {
                    document.body.removeChild(toast);
                }
            }, 300);
        }, 3000);
    }
}

// 页面加载完成后初始化
document.addEventListener('DOMContentLoaded', () => {
    // 添加平滑滚动效果
    document.querySelectorAll('a[href^="#"]').forEach(anchor => {
        anchor.addEventListener('click', function (e) {
            e.preventDefault();
            const target = document.querySelector(this.getAttribute('href'));
            if (target) {
                target.scrollIntoView({
                    behavior: 'smooth'
                });
            }
        });
    });

    // 初始化卡片生成器
    const cardGenerator = new CardGenerator();

    // 使之在全局可用，便于调试
    window.cardGenerator = cardGenerator;

    // 添加页面加载完成的视觉反馈
    document.body.style.opacity = '0';
    document.body.style.transition = 'opacity 0.5s ease';

    setTimeout(() => {
        document.body.style.opacity = '1';
    }, 100);
});

// 添加键盘快捷键支持
document.addEventListener('keydown', (e) => {
    // Ctrl/Cmd + S 保存数据
    if ((e.ctrlKey || e.metaKey) && e.key === 's') {
        e.preventDefault();
        if (window.cardGenerator) {
            window.cardGenerator.saveData();
            window.cardGenerator.showToast('数据已保存');
        }
    }

    // Ctrl/Cmd + R 重置内容
    if ((e.ctrlKey || e.metaKey) && e.key === 'r') {
        e.preventDefault();
        if (window.cardGenerator) {
            window.cardGenerator.resetAll();
        }
    }
});

// 添加页面可见性变化监听
document.addEventListener('visibilitychange', () => {
    if (!document.hidden && window.cardGenerator) {
        // 页面重新可见时保存当前数据
        window.cardGenerator.saveData();
    }
});

// 防止页面刷新时丢失数据
window.addEventListener('beforeunload', (e) => {
    if (window.cardGenerator) {
        const hasData = window.cardGenerator.cardData.name ||
                       window.cardGenerator.cardData.email ||
                       window.cardGenerator.cardData.avatar;

        if (hasData) {
            window.cardGenerator.saveData();
        }
    }
});

// 错误处理
window.addEventListener('error', (e) => {
    console.error('页面发生错误:', e.error);
    // 可以在这里添加错误上报逻辑
});