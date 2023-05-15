const webcam = document.getElementById("webcam");
const liveView = document.getElementById("liveView");
const webcamButton = document.getElementById("webcamButton");

let model;

cocoSsd.load().then(function (loadedModel) {
    model = loadedModel;
});

const getUserMedia = () => {
    return !!(navigator.getUserMedia && navigator.mediaDevices.getUserMedia);
}


const webcamEnable = (e) => {
    if (!model) {
        return;
    }

    e.target.classList.add('removed');

    const webcamProperties = {
        video: true
    }

    navigator.mediaDevices.getUserMedia(webcamProperties).then(function(stream) {
        webcam.srcObject = stream;
        webcam.addEventListener('loadeddata', webcamOutput);
    });
}

if (getUserMedia()) {
    webcamButton.addEventListener("click", webcamEnable);
} else {
    console.warn("No webcam found");
    alert("No webcam found");
}

let child = [];

const webcamOutput = () => {
    model.detect(webcam).then(function(confidence) {
        for (let i = 0; i < child.length; i++) {
            liveView.removeChild(child[i]);
        }
        child.splice(0);

        for (let x = 0; x < confidence.length; x++) {
            if (confidence[x].score > 0.1) {
                const p = document.createElement("p");
                p.innerText = confidence[x].class + " - with " + 
                Math.round(parseFloat(confidence[x].score) * 100) +
                "% confidence.";
                p.style = "margin-left: " + confidence[x].bbox[0] + "px; margin-top: " + (confidence[x].bbox[1] - 10) + "px; width: " + (confidence[x].bbox[2] - 10) + "px; top: 0; left: 0;"

                const highlighter = document.createElement("div");
                highlighter.setAttribute("class", "highlighter");
                highlighter.style = "left: " + confidence[x].bbox[0] + "px; top: " + confidence[x].bbox[1] + "px; width: " + confidence[x].bbox[2] + "px; height: " + confidence[x].bbox[3] + "px";

                liveView.appendChild(p);
                liveView.appendChild(highlighter);
                child.push(p);
                child.push(highlighter);
            }
        }
        window.requestAnimationFrame(webcamOutput);
    })
}