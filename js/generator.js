// Grab the canvas
var canvas = document.querySelector(".generator__canvas");

// Begin generator module
var generator = (function () {

  var settings = {
    width: canvas.width,
    height: canvas.height,
    context: canvas.getContext("2d"),
    template: canvas.dataset.template,
    font: { family:"\"Helvetica Neue\", \"tex_gyre_heros\", Arial, sans-serif" },
    text: "No text set.",
    image: "No image set."
  };

  var content = {
    text: "No text set.",
    image: "No image set.",
  };

  var actions = {
    addBottomGradient: function(ratio) {
      var width = settings.width,
          height = settings.height,
          context = settings.context,
          startX = 0,
          startY = height,
          endX = 0,
          endY = height - height * ratio,
          gradient = context.createLinearGradient(startX, startY, endX, endY);

      gradient.addColorStop(0, "rgba(0, 0, 0, 0.8)");
      gradient.addColorStop(1, "rgba(0, 0, 0 ,0)");
      context.fillStyle = gradient;
      context.fillRect(startX, endY, width, height);
    },
    addCourtesy: function(courtesy) {
      var fSize = 30,
          fWeight = "bold",
          startX = 100,
          startY = 35,
          rectColor = "black",
          rectOpacity = 0.5,
          padding = { top: 14, right: 70, bottom: 35, left: 35 };

      if (courtesy.length > 0) {
        if (content.text == courtesy) {
          alert("This courtesy was entered twice");
        } else {
          content.text = courtesy;
          actions.clearCanvas();
          actions.renderPortrait();
          actions.drawTextWithRect(courtesy, fSize, fWeight, startX, startY, rectColor, rectOpacity, padding);
        }
      } else {
        alert("Courtesy field is empty. Please enter text before submitting.");
      }

      /*
      if (courtesy.length > 0) {
        if (content.image == "No image set.") {
          alert("Courtesy field is empty.");
        } else if (content.text == courtesy) {
          alert("This courtesy was entered twice.");
        } else {
          content.text = courtesy;
          actions.clearCanvas();
          actions.drawTextWithRect(courtesy, fSize, fWeight, startX, startY, rectColor, rectOpacity, padding);
          console.log("Courtesy is: " + courtesy);
        }
      }
      */
    },
    clearCanvas: function() {
      settings.context.clearRect(0, 0, settings.width, settings.height);
      settings.context.beginPath(); // Essential to clear rectangles, images, etc.
    },
    clearInputs: function() {
      var allInputs = document.querySelectorAll("input");

      allInputs.forEach(function(input) {
        input.value = "";
      });
    },
    downloadCanvas: function() {
      canvas.toBlob(function(blob) {
        if (settings.template == "lower-thirds") {
          saveAs(blob, "Untitled_1280x720.png");
        } else {
          saveAs(blob, "Untitled_1280x720.jpg");
        }
      });
    },
    drawText: function(string, fSize, fWeight, startX, startY) {
      var font = settings.font,
          context = settings.context,
          socialIcon = new Image(),
          marginOfErr = 9;

      font.size = fSize;
      font.weight = fWeight;

      switch(true) {
        case actions.matchString(string, "facebook"):
          socialIcon.src = "img/icons/icon-facebook.png";
          break;
        case actions.matchString(string, "instagram"):
          socialIcon.src = "img/icons/icon-instagram.png";
          break;
        case actions.matchString(string, "twitter"):
          socialIcon.src = "img/icons/icon-twitter.png";
          break;
        default:
          socialIcon = false;
      }

      if (string.length > 0) {
        context.font = font.weight + " " + font.size + "px " + font.family;
        context.textBaseline = "hanging"; // Ensures letters render from the startY position downward
        context.fillStyle = "white";

        if (socialIcon) {
          socialIcon.onload = function () {
            context.drawImage(socialIcon, startX, startY, (fSize - marginOfErr), (fSize - marginOfErr));
          };
          context.fillText(string, (startX + 42), startY);
        } else {
          context.fillText(string, startX, startY);
        }
      }
    },
    drawTextWithRect: function(text, fSize, fWeight, startX, startY, rectColor, rectOpacity, padding) {
      var context = settings.context,
          font = settings.font;

      font.size = fSize;
      font.weight = fWeight;

      context.font = font.weight + " " + font.size + "px " + font.family; // Set font properly
      // context.textBaseline = "top"; // Draw text from top - makes life easier at the moment
      context.textBaseline = "hanging"; // Ensures letters render from the startY position downward
      context.fillStyle = rectColor;

      // Get width and height of rectangle using text size
      var rectWidth = context.measureText(text).width;
      var rectHeight = font.size;

      if (rectOpacity > 0) context.globalAlpha = 0.5;

      context.fillRect(startX, startY, (rectWidth + padding.right), (rectHeight + padding.bottom));
      context.globalAlpha = 1.0; // Reset opacity for future drawings
      context.fillStyle = "white";
      context.fillText(text, (startX + padding.left), (startY + padding.top));
    },
    enableInputs: function() {
      var disabledField = document.querySelector(".generator__fieldset--disabled"),
          children = "";

      if (disabledField) {
        children = disabledField.children;
        disabledField.classList.remove("generator__fieldset--disabled");
        for (var i = 0; i < children.length; i++) {
          if (children[i].tagName == "INPUT" || children[i].tagName == "BUTTON") {
            children[i].disabled = false;
          }
        }
      }
    },
    fitImage: function(image, width, height, startX, startY, offsetX, offsetY) {
      // Default offset is center
      offsetX = typeof offsetX === "number" ? offsetX : 0.5;
      offsetY = typeof offsetY === "number" ? offsetY : 0.5;

      // Keep bounds [0.0, 1.0]
      if (offsetX < 0) offsetX = 0;
      if (offsetY < 0) offsetY = 0;
      if (offsetX > 1) offsetX = 1;
      if (offsetY > 1) offsetY = 1;

      var imageWidth = image.width,
          imageHeight = image.height,
          ratio = Math.min(width / imageWidth, height / imageHeight),
          newWidth = imageWidth * ratio,   // New prop. width
          newHeight = imageHeight * ratio,   // New prop. height
          containerX, containerY, containerWidth, containerHeight, aspectRatio = 1;

      // Decide which gap to fill
      if (newWidth < width) aspectRatio = width / newWidth;
      if (Math.abs(aspectRatio - 1) < 1e-14 && newHeight < height) aspectRatio = height / newHeight;
      newWidth *= aspectRatio;
      newHeight *= aspectRatio;

      // Calc source rectangle
      containerWidth = imageWidth / (newWidth / width);
      containerHeight = imageHeight / (newHeight / height);

      containerX = (imageWidth - containerWidth) * offsetX;
      containerY = (imageHeight - containerHeight) * offsetY;

      // Make sure source rectangle is valid
      if (containerX < 0) containerX = 0;
      if (containerY < 0) containerY = 0;
      if (containerWidth > imageWidth) containerWidth = imageWidth;
      if (containerHeight > imageHeight) containerHeight = imageHeight;

      // Fill image in dest. rectangle
      settings.context.drawImage(image, containerX, containerY, containerWidth, containerHeight, startX, startY, width, height);
    },
    getPhonerSize: function(newHeight) {
      var ratio = content.image.width / content.image.height,
          newWidth = Math.round(newHeight * ratio);

      content.image.width = newWidth;
      content.image.height = newHeight;
      console.log("Phoner dimensions are: " + newWidth + ", " + newHeight);
    },
    matchString: function(search, find) {
      // search.toLowerCase();
      return search.includes(find);
    },
    readFile: function(input, callback) {
      var file = input.files[0],
          reader = new FileReader(),
          image = new Image(),
          display = input.parentElement.querySelector("span");

      if (file) {
        reader.onload = function(event) {
          // Must be image.src, see: https://developer.mozilla.org/en-US/docs/Web/API/CanvasRenderingContext2D/drawImage
          image.src = event.target.result;
          content.image = image;
        };
        display.innerHTML = input.value.substring(12); // Remove "C:\fakepath\" from imageURL
        reader.readAsDataURL(event.target.files[0]);
        actions.enableInputs();
        if (settings.template == "portrait") actions.clearInputs();
        console.log("User image uploaded successfully.");
      }

      setTimeout(function() {
        callback();
      }, 200);
    },
    renderPortrait: function(offsetY) {
      var width = settings.width,
          height = settings.height,
          context = settings.context,
          image = content.image;

      actions.clearCanvas();
      context.filter = "grayscale(100%) brightness(50%) blur(5px)"; // Apply filters to background image
      actions.fitImage(image, width, height, 0, 0, 0.5, (offsetY ? offsetY : 0.5)); // Draw background image
      context.filter = "none"; // Reset filters so they don't apply to the next image
      actions.fitImage(image, ((width / 2) - (width / 25)), height, (width / 2), 0); // Fit foreground image against the half-way point of canvas, crop as portrait
    },
    renderLowerThirds: function() {
      var inputsArray = document.querySelectorAll(".js-add-text-group"),
          blankInputs = 0,
          totalHeight = 0,
          startX = 80,
          startY = 720,
          marginTop = 5;

      // Check for blankInputs and get totalHeight
      inputsArray.forEach(function(input) {
        var fSize = Number(input.dataset.fontSize);
        if (!input.value) blankInputs++;
        totalHeight += fSize;
        startY -= fSize + marginTop;
      });

      startY -= 40;
      console.log(startY);

      // If no blankInputs, then get then render inputs using their data-attributes
      if (blankInputs > 0) {
        alert(blankInputs + " text field(s) empty. Please fill them out before submitting.");
      } else {
        actions.clearCanvas();
        actions.addBottomGradient(1/3);
        if (content.image != "No image set.") {
          actions.getPhonerSize(totalHeight);
          settings.context.drawImage(content.image, startX, startY, content.image.width, content.image.height);
          startX += content.image.width + 20;
        }
        for (var i = 0; i < inputsArray.length; i++) {
          actions.drawText(inputsArray[i].value, inputsArray[i].dataset.fontSize, inputsArray[i].dataset.fontWeight, startX, startY);
          startY += Number(inputsArray[i].dataset.fontSize) + marginTop;
        }
        actions.enableInputs();
      }
    },
    textGroupProps: function() {
      var inputsArray = document.querySelectorAll(".js-add-text-group"),
          properties = {
            blankInputs: 0,
            totalHeight: 0
          };

      inputsArray.forEach(function(input) {
        var fSize = Number(input.dataset.fontSize);
        if (!input.value) properties.blankInputs++;
        properties.totalHeight += fSize;
      });

      return properties;
    }
  };

  function _addListeners() {
    var fieldsets = document.querySelectorAll(".generator__fieldset");

    fieldsets.forEach(function(fieldset) {
      var fieldButton = fieldset.querySelector(".generator__button"),
          fieldInput = fieldset.querySelector("input");

      fieldButton.addEventListener("click", function() {
        var inputClass = fieldInput.className,
            inputValue = fieldInput.value;

        switch (true) {
          case actions.matchString(inputClass, "js-add-courtesy"):
            actions.addCourtesy(inputValue);
            break;
          case actions.matchString(inputClass, "js-upload-portrait"):
            fieldInput.click();
            fieldInput.onchange = function() {
              actions.readFile(fieldInput, actions.renderPortrait);
            };
            break;
          case actions.matchString(inputClass, "js-upload-phoner"):
            fieldInput.click();
            fieldInput.onchange = function() {
              actions.readFile(fieldInput, actions.renderLowerThirds);
            };
            break;
          case actions.matchString(inputClass, "js-add-text-group"):
            actions.renderLowerThirds();
            break;
          default:
            console.log("No match found for inputClass.");
            break;
        }
      });
    });
  }

  function _setSortables() {
    var sortParent = document.getElementById("jsSortable");
    if (sortParent) {
      var sortable = Sortable.create(sortParent, {
        draggable: ".js-sortable-item", // must include the dot
        dragClass: "js-sortable-drag",
        ghostClass: "js-sortable-ghost",
        chosenClass: "js-sortable-chosen",
        filter: ".js-sortable-remove",
        onFilter: function(event) {
          var item = event.item,
              control = event.target;

          if (Sortable.utils.is(control, ".js-sortable-remove")) {
            item.parentNode.removeChild(item);
          }
        },
        onEnd: function(event) {
          //
        }
      });
    } else {
      console.log("No sortable items found.");
    }
  }

  // Inits
  _addListeners();
  _setSortables();

  if (settings.template == "lower-thirds") {
    actions.addBottomGradient(1/3);
  }

  return actions;
})(canvas);
