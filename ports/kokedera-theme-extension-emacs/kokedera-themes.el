;;; kokedera-themes.el --- Kokedera theme discovery -*- lexical-binding: t; -*-
;; Package-Requires: ((emacs "27.1"))
;; Version: 1.0.0
;; Author: Kokedera
;; URL: https://kokedera.style

;;;###autoload
(when load-file-name
  (add-to-list 'custom-theme-load-path
               (file-name-as-directory (file-name-directory load-file-name))))

(provide 'kokedera-themes)
;;; kokedera-themes.el ends here
