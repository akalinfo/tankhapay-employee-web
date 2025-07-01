import { Component, OnInit, ViewChild, ElementRef, Renderer2, OnDestroy, AfterViewInit, HostListener } from '@angular/core';
import jwtDecode from 'jwt-decode';
import { ToastrService } from 'ngx-toastr';
import { dongleState, grooveState } from 'src/app/app.animation';
import { SessionService } from 'src/app/shared/services/session.service';
import { FaceCheckinService } from '../face-checkin.service';

import * as blazeface from '@tensorflow-models/blazeface';
import '@tensorflow/tfjs-backend-webgl';

declare var $: any;

@Component({
  selector: 'app-face-checkin',
  templateUrl: './face-checkin.component.html',
  styleUrls: ['./face-checkin.component.css'],
  animations: [dongleState, grooveState]
})
export class FaceCheckinComponent implements AfterViewInit,OnInit, OnDestroy  {
  @ViewChild('webcamElement') webcamElement: ElementRef<HTMLVideoElement>;
  @ViewChild('overlayCanvas') overlayCanvas: ElementRef<HTMLCanvasElement>;
  @ViewChild('fullscreenDiv') fullscreenDiv!: ElementRef;
  continueProcessing: boolean = true;
  tp_account_id: any;
  product_type: any = '';
  showSidebar: boolean = true;
  decoded_token: any;
  showMessage: any;
  showWebcam: boolean = false;
  capturedImage: any;
  isFullscreen: boolean = false;
  isFullscreenMsg: boolean = false;
  lastCapturedImage: string | null = null;
  debounceTimeout: any = null;

  private model: blazeface.BlazeFaceModel;

  constructor(
    private _faceCheckinService: FaceCheckinService,
    private _sessionService: SessionService,
    private toastr: ToastrService,
    private renderer: Renderer2

  ) {
  }

  async ngOnInit() {
    let session_obj = this._sessionService.get_user_session();
    let token = JSON.parse(session_obj).token;
    this.decoded_token = jwtDecode(token);
    this.tp_account_id = this.decoded_token.tp_account_id;
    this.product_type = localStorage.getItem('product_type');
    // Listen for fullscreen change events
    document.addEventListener('fullscreenchange', this.onFullscreenChange.bind(this));
    document.addEventListener('webkitfullscreenchange', this.onFullscreenChange.bind(this));
    document.addEventListener('mozfullscreenchange', this.onFullscreenChange.bind(this));
    document.addEventListener('MSFullscreenChange', this.onFullscreenChange.bind(this));

  }
  toggle() {
    this.showSidebar = !this.showSidebar;
  }
  async ngAfterViewInit() {
    await this.loadModel();
    this.setupWebcam();

  }
  ngOnDestroy(): void {
    // Remove event listeners when component is destroyed
    document.removeEventListener('fullscreenchange', this.onFullscreenChange.bind(this));
    document.removeEventListener('webkitfullscreenchange', this.onFullscreenChange.bind(this));
    document.removeEventListener('mozfullscreenchange', this.onFullscreenChange.bind(this));
    document.removeEventListener('MSFullscreenChange', this.onFullscreenChange.bind(this));
  }

  async loadModel() {
    this.model = await blazeface.load();
  }

  async setupWebcam() {
    try {
      const video = this.webcamElement.nativeElement;

      if (navigator.mediaDevices && navigator.mediaDevices.getUserMedia) {
        const stream = await navigator.mediaDevices.getUserMedia({ video: true });
        video.srcObject = stream;
        await video.play();
        this.detectFaces();
      } else {
        console.error('getUserMedia not supported in this browser.');
      }
    } catch (err) {
      console.error('Error accessing webcam: ', err);
      if (err.name === 'NotAllowedError') {
        alert('Permission to access the camera was denied.');
      } else if (err.name === 'NotFoundError') {
        alert('No camera device found.');
      } else if (err.name === 'NotReadableError') {
        alert('Could not access the camera. It might be already in use.');
      } else {
        alert('An unknown error occurred: ' + err.message);
      }
    }
  }

  drawFixedSquare(context: CanvasRenderingContext2D, x: number, y: number, width: number, height: number) {
    context.lineWidth = 3;
    context.strokeStyle = '#fff';
  
    const cornerLength = 50;
  
    context.beginPath();
    context.moveTo(x, y);
    context.lineTo(x + cornerLength, y);
    context.moveTo(x, y);
    context.lineTo(x, y + cornerLength);
    context.moveTo(x + width, y);
    context.lineTo(x + width - cornerLength, y);
    context.moveTo(x + width, y);
    context.lineTo(x + width, y + cornerLength);
    context.moveTo(x, y + height);
    context.lineTo(x + cornerLength, y + height);
    context.moveTo(x, y + height);
    context.lineTo(x, y + height - cornerLength);
    context.moveTo(x + width, y + height);
    context.lineTo(x + width - cornerLength, y + height);
    context.moveTo(x + width, y + height);
    context.lineTo(x + width, y + height - cornerLength);
    context.stroke();
  }

  async detectFaces() {
    const video = this.webcamElement.nativeElement;
    const canvas = this.overlayCanvas.nativeElement;
    const context = canvas.getContext('2d');

    this.updateCanvasSize(video, canvas);

    const processLoop = async () => {
      if (!this.continueProcessing) {
        return;
      }

      context.clearRect(0, 0, canvas.width, canvas.height);

      // Draw fixed square
     // const squareWidth = canvas.width * 0.65;
      //const squareHeight = canvas.height * 0.65;
      const squareWidth = canvas.width * 0.50;
      const squareHeight = canvas.height * 0.50;
      const squareX = (canvas.width - squareWidth) / 2;
      const squareY = (canvas.height - squareHeight) / 2;
      console.log(squareWidth, 'squareWidth', squareHeight, 'squareHeight', squareX, 'squareX', squareY, 'squareY');


      this.drawFixedSquare(context, squareX, squareY, squareWidth, squareHeight);

      let faceDetectedInSquare = false;

      const predictions = await this.model.estimateFaces(video, false);

      if (predictions.length > 0) {
        for (const prediction of predictions) {
          let shouldSkip = false;
          const start = prediction.topLeft as [number, number];
          const end = prediction.bottomRight as [number, number];
          const landmarks = prediction.landmarks as [number, number][];
          const score = prediction.probability as number;

          // Check if the detection score is above the threshold
          if (!score || score < 0.8) {
            shouldSkip = true;
          }

          // Check if the face is straight based on landmarks (eyes and nose position)
          const [leftEye, rightEye, nose] = landmarks;
          if (Math.abs(leftEye[1] - rightEye[1]) > 10 || Math.abs(nose[0] - (leftEye[0] + rightEye[0]) / 2) > 20) {
            shouldSkip = true;
          }

          if (shouldSkip) {
            continue;
          }

          // Check if the face is within the fixed square
          if (
            start[0] >= squareX &&
            start[1] >= squareY &&
            end[0] <= squareX + squareWidth &&
            end[1] <= squareY + squareHeight
          ) {
            faceDetectedInSquare = true;

            // Draw circle around the face
            const centerX = (start[0] + end[0]) / 2;
            const centerY = (start[1] + end[1]) / 2;
            const radius = Math.max(end[0] - start[0], end[1] - start[1]) / 2;

            context.beginPath();
            context.arc(centerX, centerY, radius, 0, 2 * Math.PI);
            context.lineWidth = 2;
            context.strokeStyle = 'green';
            context.stroke();
          }

          if (faceDetectedInSquare) {
            context.font = '26px Arial';
            context.fillStyle = 'green';
            context.fillText('Face Detected within Square', 10, 116);

            // Capture image of the face within the square
            const imageData = this.captureFaceImage(video, start, end, 85);
            // setTimeout(() => {
            //   this.blurVideoFeed(video, context);
            // }, 1000);
          await this.showCountdownAndDetectFaces(imageData);
            setTimeout(async () => {
           await this.checkInOut(imageData);
            }, 100);
          } else {
            context.font = '16px Arial';
            context.fillStyle = 'red';
            context.fillText('No Face Detected within Square', 10, 116);
          }
        }
      } else {
        context.font = '16px Arial';
        context.fillStyle = 'red';
        context.fillText('No Face Detected', 10, 116);
      }

      if (this.continueProcessing) {
        const video = this.webcamElement.nativeElement;
        await video.play();
        setTimeout(processLoop, 10000);
      }
    };

    processLoop();

    
  }

  captureFaceImage(video: HTMLVideoElement, start: [number, number], end: [number, number], padding: number): string {
    const captureCanvas = document.createElement('canvas');
    const faceWidth = end[0] - start[0];
    const faceHeight = end[1] - start[1];
    
    const paddedStartX = Math.max(0, start[0] - padding);
    const paddedStartY = Math.max(0, start[1] - padding);
    const paddedEndX = Math.min(video.videoWidth, end[0] + padding);
    const paddedEndY = Math.min(video.videoHeight, end[1] + padding);
  
    const paddedWidth = paddedEndX - paddedStartX;
    const paddedHeight = paddedEndY - paddedStartY;
  
    captureCanvas.width = paddedWidth;
    captureCanvas.height = paddedHeight;
    const captureContext = captureCanvas.getContext('2d');
  
    if (captureContext) {
      captureContext.drawImage(
        video,
        paddedStartX, paddedStartY, paddedWidth, paddedHeight,
        0, 0, paddedWidth, paddedHeight
      );
    }
  
    return captureCanvas.toDataURL('image/png');
  }

  captureImage(video: HTMLVideoElement, canvas: HTMLCanvasElement): string {
    const captureCanvas = document.createElement('canvas');
    captureCanvas.width = video.videoWidth;
    captureCanvas.height = video.videoHeight;
    const captureContext = captureCanvas.getContext('2d');

    if (captureContext) {
      captureContext.drawImage(video, 0, 0, video.videoWidth, video.videoHeight);
      captureContext.drawImage(canvas, 0, 0); // Draw the overlay canvas on top
    }

    return captureCanvas.toDataURL('image/png');
  }

  blurVideoFeed(video: HTMLVideoElement, context: CanvasRenderingContext2D) {
    video.pause();
    context.filter = 'blur(5px)';
    context.drawImage(video, 0, 0, video.videoWidth, video.videoHeight);
    context.filter = 'none';
  }

  async showCountdownAndDetectFaces(imageData: any) {
    const canvas = this.overlayCanvas.nativeElement;
    const context = canvas.getContext('2d');
    const video = this.webcamElement.nativeElement;
    this.updateCanvasSize(video, canvas);

    const countdown = async (seconds: number) => {
      for (let i = seconds; i > 0; i--) {
        context.clearRect(0, 0, canvas.width, canvas.height);
        context.font = '72px Arial';
        context.fillStyle = 'green';
        context.fillText(i.toString(), canvas.width / 2 - 20, canvas.height / 2);
        await new Promise(resolve => setTimeout(resolve, 1000));
      }
      context.clearRect(0, 0, canvas.width, canvas.height);
    };

    await countdown(3);
    this.blurVideoFeed(video, context)
  }

  // Function to capture image and call API
  async checkInOut(imageData: any): Promise<void> {
    try {
      this.continueProcessing = false; // Pause processing
      this.capturedImage = imageData;
      const image = this.capturedImage.split(',')[1];
      console.log(image, 'imageee')
      const imageExtension = this.getImageExtension(this.capturedImage);
      const data = {
        accountid: this.tp_account_id.toString(),
        userby: this.tp_account_id?.toString(),
        imageExtension: imageExtension,
      };
      this._faceCheckinService.markAttendance({
        "image": image,
        "data": data
      }).subscribe((resData: any) => {
        if (resData.statusCode) {
          this.toastr.success(resData.message);
          this.displayCapturedImageAndMessage(imageData, resData.message,resData.statusCode);
        } else {
          this.toastr.error(resData.message);
        }
        this.showMessage = resData.message;
        
        // Resume processing after a delay
        setTimeout(() => {
          this.showMessage = '';
          this.continueProcessing = true;
          const video = this.webcamElement.nativeElement;
          video.play();
          this.detectFaces(); // Restart the process
        }, 5000); // Restart after 5 seconds
      });
    } catch (error) {
      this.toastr.error('API error:', error);
      this.continueProcessing = true; // Ensure processing continues on error
      setTimeout(() => {
        this.showMessage = '';
        const video = this.webcamElement.nativeElement;
        video.play();
        this.detectFaces(); // Restart the process
      }, 5000); // Restart after 5 seconds
    }
  }

  displayCapturedImageAndMessage(imageData: string, name: string,status:any) {
    const canvas = this.overlayCanvas.nativeElement;
    const context = canvas.getContext('2d');
  
    // Clear previous drawings
    context.clearRect(0, 0, canvas.width, canvas.height);
  
    // Draw the circular captured image
    const image = new Image();
    image.src = imageData;
    image.onload = () => {
      const imageSize = canvas.height * 0.1; // Reduce the size for top positioning
      const padding = 20;
      const totalWidth = imageSize + padding + 300; // Total width including image and text
  
      const imageX = (canvas.width - totalWidth) / 2;
      const imageY = (canvas.height - imageSize) / 1.2;
  
      // Draw circular image
      context.save();
      context.beginPath();
      context.arc(imageX + imageSize / 2, imageY + imageSize / 2, imageSize / 2, 0, Math.PI * 2);
      context.closePath();
      context.clip();
      context.drawImage(image, imageX, imageY, imageSize, imageSize);
      context.restore();
  
      // Draw the background for the message
      const messageBackgroundX = imageX + imageSize + padding;
      const messageBackgroundY = imageY;
      const messageBackgroundWidth = 300;
      const messageBackgroundHeight = imageSize;
  
      context.fillStyle = 'rgba(0, 0, 0, 0.5)';
      context.fillRect(messageBackgroundX, messageBackgroundY, messageBackgroundWidth, messageBackgroundHeight);
  
      // Get current date and time
      const currentDate = new Date();
      const date = currentDate.toLocaleDateString();
      const time = currentDate.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }); // Format without seconds
  
      // Calculate dynamic font size
      const fontSizeLarge = Math.round(imageSize * 0.21); // 25% of image size
      const fontSizeSmall = Math.round(imageSize * 0.18); // 15% of image size
  
      // Set text properties
      context.textAlign = 'left';
      context.fillStyle = 'white';
  
      // Draw bold "Welcome, [name]" text
      context.font = `bold ${fontSizeLarge}px Arial`;
      context.fillText(`${name}`, messageBackgroundX + 10, messageBackgroundY + fontSizeLarge + 5);
  
      // Draw check-in time with reduced padding
      context.font = `${fontSizeSmall}px Arial`;
      if(status == true){
        context.fillText(`Attendance Marked | ${time}`, messageBackgroundX + 10, messageBackgroundY + fontSizeLarge + 10 + fontSizeSmall);
      }
    };
  }
  

  getImageExtension(base64String: string): string {
    const mime = base64String.split(';')[0].split(':')[1];
    const extension = mime.split('/')[1];
    return extension;
  }

  private handleFullscreenChange() {
    if (!document.fullscreenElement) {
      $('.mirrored').removeClass('fullScreenVideo');
    }
  }
  onFullscreenChange(): void {
    const fullscreenElement = document.fullscreenElement ||
      (document as any).webkitFullscreenElement ||
      (document as any).mozFullScreenElement ||
      (document as any).msFullscreenElement;

    if (fullscreenElement) {
      this.isFullscreen = true;
      this.isFullscreenMsg = true;
      $('.mirrored').addClass('fullScreenVideo');
    } else {
      this.isFullscreen = false;
      this.isFullscreenMsg = false;
      $('.mirrored').removeClass('fullScreenVideo');
    }
  }

  toggleFullscreen() {
    const fullscreenDiv = this.fullscreenDiv.nativeElement as HTMLElement;

    if (!document.fullscreenElement) {
      this.enterFullscreen(fullscreenDiv);
    } else {
      this.exitFullscreen();
    }
  }

  enterFullscreen(element: any) {
    this.isFullscreenMsg = true;
    this.isFullscreen = true;
    $('.mirrored').addClass('fullScreenVideo');
    if (element.requestFullscreen) {
      element.requestFullscreen();
    } else if (element.mozRequestFullScreen) {
      element.mozRequestFullScreen();
    } else if (element.webkitRequestFullscreen) {
      element.webkitRequestFullscreen();
    } else if (element.msRequestFullscreen) {
      element.msRequestFullscreen();
    }
  }

  exitFullscreen() {
    this.isFullscreenMsg = false;
    this.isFullscreen = false;
    if (document.exitFullscreen) {
      document.exitFullscreen();
      $('.mirrored').removeClass('fullScreenVideo');
    } else if ((document as any).mozCancelFullScreen) { /* Firefox */
      (document as any).mozCancelFullScreen();
      $('.mirrored').removeClass('fullScreenVideo');
    } else if ((document as any).webkitExitFullscreen) { /* Chrome, Safari and Opera */
      (document as any).webkitExitFullscreen();
      $('.mirrored').removeClass('fullScreenVideo');
    } else if ((document as any).msExitFullscreen) { /* IE/Edge */
      (document as any).msExitFullscreen();
      $('.mirrored').removeClass('fullScreenVideo');
    }
  }

  updateCanvasSize(video: HTMLVideoElement, canvas: HTMLCanvasElement) {
    canvas.width = video.videoWidth;
    canvas.height = video.videoHeight;
  }

}