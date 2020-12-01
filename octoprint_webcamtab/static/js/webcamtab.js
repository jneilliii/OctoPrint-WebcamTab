/*
 * View model for OctoPrint-WebcamTab
 *
 * Author: Sven Lohrmann
 * License: AGPLv3
 */
$(function() {
    function WebcamTabViewModel(parameters) {
        var self = this;

        self.control = parameters[0];

        self.control.onTabChange = function (current, previous) {
            // replaced #control with #tab_plugin_webcamtab
            if (current == "#tab_plugin_webcamtab") {
                self.control._enableWebcam();
            } else if (previous == "#tab_plugin_webcamtab") {
                self.control._disableWebcam();
            }
        };

        self.control._enableWebcam = function() {
            // replaced #control with #tab_plugin_webcamtab
            if (OctoPrint.coreui.selectedTab != "#tab_plugin_webcamtab" || !OctoPrint.coreui.browserTabVisible) {
                return;
            }

            if (self.control.webcamDisableTimeout != undefined) {
                clearTimeout(self.control.webcamDisableTimeout);
            }

            self.moveWebcams();
            // Determine stream type and switch to corresponding webcam.
            var streamType = determineWebcamStreamType(self.control.settings.webcam_streamUrl());
            if (streamType == "mjpg") {
                self.control._switchToMjpgWebcam();
            } else if (streamType == "hls") {
                self.control._switchToHlsWebcam();
            } else {
                throw "Unknown stream type " + streamType;
            }

            var webcamImage = $("#webcam_image");
            var currentSrc = webcamImage.attr("src");

            // safari bug doesn't release the mjpeg stream, so we just set it up the once
            if (OctoPrint.coreui.browser.safari && currentSrc != undefined) {
                return;
            }

            var newSrc = self.control.settings.webcam_streamUrl();
            if (currentSrc != newSrc) {
                if (newSrc.lastIndexOf("?") > -1) {
                    newSrc += "&";
                } else {
                    newSrc += "?";
                }
                newSrc += new Date().getTime();

                self.control.webcamLoaded(false);
                self.control.webcamError(false);
                webcamImage.attr("src", newSrc);
            }
        };

        self.moveWebcams = function() {
            var tab = $("#tab_plugin_webcamtab");
            var webcam = $("#control > #webcam_container, #control > #webcam_hls_container");
            if (webcam) {
                var hint = webcam.next();
                tab.append(webcam.detach());
                if (hint && hint.attr("data-bind") === "visible: keycontrolPossible") {
                    tab.append(hint.detach());
                }
            }
        };
    };

    OCTOPRINT_VIEWMODELS.push({
        construct: WebcamTabViewModel,
        dependencies: ["controlViewModel"],
        elements: ["#tab_plugin_webcamtab"]
    });
});
