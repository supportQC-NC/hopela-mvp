// backend/controllers/photoController.js
import asyncHandler from "../middleware/asyncHandler.js";
import path from "path";
import fs from "fs";

/**
 * Extensions d'images supportées (ordre de priorité)
 */
const SUPPORTED_EXTENSIONS = ["jpg", "jpeg", "png", "webp", "gif", "bmp"];

/**
 * Cherche un fichier photo avec différentes extensions et casses
 * @param {string} basePath - Chemin de base
 * @param {string} nartClean - Code article nettoyé
 * @returns {object|null} - { photoPath, extension } ou null
 */
const findPhotoFile = (basePath, nartClean) => {
  for (const ext of SUPPORTED_EXTENSIONS) {
    const testPath          = path.join(basePath, `${nartClean}.${ext}`);
    const testPathUpper     = path.join(basePath, `${nartClean.toUpperCase()}.${ext}`);
    const testPathExtUpper  = path.join(basePath, `${nartClean}.${ext.toUpperCase()}`);
    const testPathAllUpper  = path.join(basePath, `${nartClean.toUpperCase()}.${ext.toUpperCase()}`);

    if (fs.existsSync(testPath))         return { photoPath: testPath,         extension: ext };
    if (fs.existsSync(testPathUpper))    return { photoPath: testPathUpper,    extension: ext };
    if (fs.existsSync(testPathExtUpper)) return { photoPath: testPathExtUpper, extension: ext };
    if (fs.existsSync(testPathAllUpper)) return { photoPath: testPathAllUpper, extension: ext };
  }
  return null;
};

/**
 * @desc    Obtenir la photo d'un article
 * @route   GET /api/photos/:trigramme/:nart
 * @access  Private
 */
const getArticlePhoto = asyncHandler(async (req, res) => {
  const { trigramme, nart } = req.params;

  // Chemin construit directement depuis le trigramme (dossier dans uploads)
  const basePath = path.join("uploads", "photos", trigramme.toUpperCase());

  if (!fs.existsSync(basePath)) {
    res.status(404);
    throw new Error(`Dossier photos introuvable pour le trigramme ${trigramme}`);
  }

  const nartClean   = nart.trim().replace(/[^a-zA-Z0-9_\-]/g, "");
  const photoResult = findPhotoFile(basePath, nartClean);

  if (!photoResult) {
    res.status(404);
    throw new Error(`Photo non trouvée pour l'article ${nart}`);
  }

  const { photoPath, extension } = photoResult;

  const mimeTypes = {
    jpg: "image/jpeg", jpeg: "image/jpeg",
    png: "image/png",  webp: "image/webp",
    gif: "image/gif",  bmp: "image/bmp",
  };
  const mimeType = mimeTypes[extension.toLowerCase()] || "image/jpeg";

  const stats        = fs.statSync(photoPath);
  const lastModified = stats.mtime.toUTCString();
  const etag         = `"${stats.size}-${stats.mtime.getTime()}"`;

  if (req.headers["if-none-match"] === etag || req.headers["if-modified-since"] === lastModified) {
    return res.status(304).end();
  }

  res.setHeader("Content-Type",  mimeType);
  res.setHeader("Cache-Control", "public, max-age=3600");
  res.setHeader("Last-Modified", lastModified);
  res.setHeader("ETag",          etag);

  fs.createReadStream(photoPath).pipe(res);
});

/**
 * @desc    Vérifier si une photo existe
 * @route   HEAD /api/photos/:trigramme/:nart
 * @access  Private
 */
const checkPhotoExists = asyncHandler(async (req, res) => {
  const { trigramme, nart } = req.params;

  const basePath = path.join("uploads", "photos", trigramme.toUpperCase());

  if (!fs.existsSync(basePath)) return res.status(404).end();

  const nartClean   = nart.trim().replace(/[^a-zA-Z0-9_\-]/g, "");
  const photoResult = findPhotoFile(basePath, nartClean);

  return photoResult ? res.status(200).end() : res.status(404).end();
});

export { getArticlePhoto, checkPhotoExists };