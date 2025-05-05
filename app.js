document.getElementById('currentYear').textContent = new Date().getFullYear();

// Replace with your actual Hugging Face API token
const API_TOKEN = "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";

class AnuArt {
    constructor() {
        this.form = document.getElementById('generationForm');
        this.preview = document.getElementById('preview');
        this.previewText = document.getElementById('previewText');
        this.generatedImage = document.getElementById('generatedImage');
        this.controls = document.getElementById('controls');
        this.downloadBtn = document.getElementById('download');
        this.shareBtn = document.getElementById('share');
        this.feedback = document.getElementById('feedback');
        
        this.initializeEventListeners();
    }

    initializeEventListeners() {
        this.form.addEventListener('submit', (e) => this.handleSubmit(e));
        this.downloadBtn.addEventListener('click', () => this.downloadImage());
        this.shareBtn.addEventListener('click', () => this.shareImage());
    }

    async handleSubmit(e) {
        e.preventDefault();
        
        const prompt = document.getElementById('prompt').value;
        const style = document.getElementById('style').value;
        const size = document.getElementById('size').value;

        if (!prompt) {
            this.showFeedback('Please enter a description', 'error');
            return;
        }

        this.showLoading();

        try {
            const imageUrl = await this.generateImage(prompt, style, size);
            this.displayImage(imageUrl);
            this.showFeedback('Image generated successfully!', 'success');
        } catch (error) {
            this.showFeedback('Failed to generate image. Please try again.', 'error');
            console.error('Error:', error);
        }
    }

    async generateImage(prompt, style, size) {
        const stylePrompts = {
            realistic: 'realistic, highly detailed, photographic',
            anime: 'anime style, cel shaded, vibrant',
            digital: 'digital art, concept art, detailed',
            oil: 'oil painting, traditional media, textured',
            watercolor: 'watercolor painting, soft, flowing',
            sketch: 'pencil sketch, black and white, detailed lines'
        };

        const [width, height] = size.split('x').map(Number);
        const enhancedPrompt = `${prompt}, ${stylePrompts[style]}`;

        try {
            const response = await fetch(
                "https://api-inference.huggingface.co/models/stabilityai/stable-diffusion-xl-base-1.0",
                {
                    method: "POST",
                    headers: {
                        "Authorization": `Bearer ${API_TOKEN}`,
                        "Content-Type": "application/json"
                    },
                    body: JSON.stringify({
                        inputs: enhancedPrompt,
                        parameters: {
                            width: width,
                            height: height,
                            negative_prompt: "blurry, bad quality, distorted"
                        }
                    })
                }
            );

            if (!response.ok) {
                throw new Error('Failed to generate image');
            }

            const blob = await response.blob();
            return URL.createObjectURL(blob);
        } catch (error) {
            console.error('API Error:', error);
            throw error;
        }
    }

    displayImage(url) {
        this.previewText.style.display = 'none';
        this.generatedImage.src = url;
        this.generatedImage.classList.remove('hidden');
        this.controls.classList.remove('hidden');
    }

    showLoading() {
        this.previewText.textContent = 'Generating...';
        this.previewText.style.display = 'block';
        this.generatedImage.classList.add('hidden');
        this.controls.classList.add('hidden');
        this.preview.classList.add('loading');
    }

    async downloadImage() {
        const a = document.createElement('a');
        a.href = this.generatedImage.src;
        a.download = 'anuart-creation.png';
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
    }

    async shareImage() {
        try {
            const blob = await fetch(this.generatedImage.src).then(r => r.blob());
            const file = new File([blob], 'anuart-creation.png', { type: 'image/png' });
            
            if (navigator.share) {
                await navigator.share({
                    files: [file],
                    title: 'Check out my Anu Art creation!',
                    text: 'Generated with Anu Art'
                });
            } else {
                this.showFeedback('Sharing is not supported on this device', 'error');
            }
        } catch (error) {
            this.showFeedback('Failed to share image', 'error');
        }
    }

    showFeedback(message, type) {
        this.feedback.textContent = message;
        this.feedback.className = `fixed bottom-4 right-4 p-4 rounded-lg feedback-${type}`;
        this.feedback.classList.remove('hidden');
        
        setTimeout(() => {
            this.feedback.classList.add('hidden');
        }, 3000);
    }
}

// Initialize the application
document.addEventListener('DOMContentLoaded', () => {
    new AnuArt();

    // Add click handlers for example prompts
    document.querySelectorAll('.example-prompt').forEach(button => {
        button.addEventListener('click', () => {
            document.getElementById('prompt').value = button.textContent.trim();
        });
    });
});
