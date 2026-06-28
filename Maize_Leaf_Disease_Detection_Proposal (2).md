# Automated Maize Leaf Disease Detection Using Deep Learning

**A Comparative Study with a Vision Transformer (ViT) as the Primary Model, Tuned via Grey Wolf Optimizer (GWO), on a Recent Field-Collected Dataset**

---

## 1. Problem Statement & Objective

Maize is a staple crop whose yield is heavily affected by foliar diseases. Manual diagnosis is slow, expertise-dependent, and error-prone. This project develops an automated image-classification system that identifies the disease state of a maize leaf from a single photograph captured under **real field conditions**. The primary objective is to train a **Vision Transformer (ViT)** classifier whose hyperparameters are optimized using a **swarm-based metaheuristic — the Grey Wolf Optimizer (GWO) from the `mealpy` package** — and to rigorously benchmark it against three CNN baselines (**MobileNetV2, VGG16, and ResNet50**) under identical conditions. As an additive enhancement, a lightweight **SqueezeNet** feature stream is fused with the ViT at the decision level using **GWO-optimized fusion weights**, designed so that it can improve — but never degrade — the standalone ViT result. The work is supported by stage-by-stage visualization (including the optimizer's convergence behavior) and a full suite of performance metrics. The central hypothesis is that an attention-based ViT, combined with swarm-driven tuning and a complementary lightweight feature stream, can match or exceed conventional CNN backbones on realistic, in-field maize imagery.

## 2. Dataset Description & Analysis

**Source:** *Crop Pest and Disease Dataset (CCMT)* — Kaggle, maize subset. Collected from farms in **Ghana (October–December 2022)** with a high-resolution DSLR camera, expert-validated by plant virologists, and released under a CC BY 4.0 license. This replaces older PlantVillage-derived data (≈2015, lab-controlled) with **recent, real-world field imagery** featuring natural variation in lighting, background, camera angle, and noise.

**Composition:** the maize subset contains ~5,389 raw images across **seven classes** (three diseases, three pests, and healthy). To preserve a focused disease-classification task and a clean four-class structure, this study uses the **four disease/healthy classes**:

| Class | Type | Notes |
|---|---|---|
| Leaf Blight | Disease | Northern leaf blight equivalent |
| Leaf Spot | Disease | Gray leaf spot equivalent |
| Maize Streak Virus | Disease | Major African maize disease; absent from legacy lab datasets |
| Healthy | — | Disease-free leaves |

*(Exact per-class counts are confirmed on download. The three pest classes — fall armyworm, grasshopper, leaf beetle — are retained as an optional extension to a 7-class pest-and-disease task.)*

**Key analytical observations:** (1) the dataset is expected to be **class-imbalanced**, addressed via class weighting, targeted augmentation, and macro-averaged metrics; (2) unlike lab datasets, these are **complex-background field images**, which makes robust preprocessing (segmentation, illumination and color normalization, denoising) essential rather than optional; (3) the realistic distribution improves the practical, deployment-facing value of the trained model.

## 3. Methodology

### 3.1 Preprocessing & Normalization
Field imagery requires a stronger preprocessing pipeline than lab data:
- **Leaf segmentation / background removal:** isolate the leaf from cluttered field backgrounds using HSV-based color thresholding or a learned mask (GrabCut / lightweight U-Net), reducing background bias.
- **Illumination normalization:** **CLAHE** (Contrast-Limited Adaptive Histogram Equalization) to standardize contrast across varied lighting.
- **Color constancy:** Gray-World / Shades-of-Gray white-balance correction to counter inconsistent field lighting and camera color casts.
- **Denoising:** edge-preserving **bilateral filtering** (and optional Gaussian) to suppress sensor/field noise while retaining lesion edges.
- **Resizing & color space:** all images resized to 224×224, kept in RGB; corrupt/duplicate images removed in a cleaning pass.
- **Pixel normalization (compared):** (a) rescaling to [0,1], (b) mean–std standardization, and (c) each backbone's native `preprocess_input` (ImageNet statistics), with the matching scheme used for final runs.

### 3.2 Data Augmentation
Applied to the training set only, with stronger augmentation on minority classes:
- Random rotation, horizontal/vertical flip, width/height shift, zoom, shear, and brightness/contrast jitter (`ImageDataGenerator` / `tf.image` / Keras preprocessing layers).
- **Class imbalance handling:** computed **class weights** plus targeted augmentation for under-represented classes.

### 3.3 Train / Validation / Test Split
- **Stratified split** preserving class ratios: **70% train / 15% validation / 15% test**.
- Test set held out and untouched during training/tuning to give an unbiased final estimate.

### 3.4 Model Architecture
- **Primary model — Vision Transformer (ViT-B/16):** an ImageNet-pretrained ViT used via **transfer learning** (training from scratch is avoided — the dataset is far below the scale ViTs need). The image is split into 16×16 patches, linearly embedded with positional encodings, and processed by multi-head self-attention encoder blocks; the classification token feeds a new head (Dropout → Dense softmax, 4 classes). Lower encoder blocks are frozen initially, then upper blocks are fine-tuned at a reduced learning rate. (Implementation via `vit-keras`/TensorFlow or a `timm`/PyTorch ViT.)
- **Comparison models:** MobileNetV2, VGG16, ResNet50 — each adapted with the same custom classification head and trained under the **same split, augmentation, and evaluation protocol** to ensure a fair comparison.

### 3.5 Hyperparameter Tuning with Grey Wolf Optimizer (GWO)
The ViT's hyperparameters are tuned automatically using the **Grey Wolf Optimizer from the `mealpy` library**, a swarm-based metaheuristic that mimics the leadership hierarchy and hunting behavior of grey wolves.
- **Search space (decision variables):** learning rate (log scale), dropout rate, batch size, number of fine-tuned (unfrozen) encoder blocks, weight decay, and dense head size. Continuous and discrete variables are handled through bounded ranges with rounding/mapping.
- **Fitness function:** each candidate solution configures and trains the ViT for a small number of epochs, then returns the **validation macro-F1**; since `mealpy` minimizes, the objective is `1 − macro-F1`. Macro-F1 is chosen so minority classes are weighted fairly.
- **Search budget (cost control):** a small wolf population and a limited iteration count, with short per-evaluation training (and optionally a data subset / early pruning) to keep the search computationally feasible. The best configuration found is then retrained fully to convergence.
- **Fairness option:** the same GWO routine can be applied to the CNN baselines so that *every* model is tuned under an equal optimization budget, strengthening the comparative claim.

### 3.6 Training Configuration
- **Loss:** categorical cross-entropy. **Optimizer:** Adam/AdamW with the GWO-selected learning rate and weight decay; learning-rate reduction on plateau.
- **Regularization/control:** Dropout, **EarlyStopping**, and **ModelCheckpoint** (best-weights restoration by validation loss).
- **Reproducibility:** fixed random seeds; the final ViT uses the best GWO-found hyperparameters, and all models share the same split, augmentation, and evaluation protocol.

### 3.7 Complementary SqueezeNet Feature Stream with GWO-Weighted Fusion
To leverage a lightweight CNN **without altering or risking the ViT**, SqueezeNet is added as a *parallel* stream and combined only at the decision level (late fusion). The ViT is never modified internally — SqueezeNet sits beside it, not inside it.
- **SqueezeNet role:** an ImageNet-pretrained SqueezeNet (~1.2M parameters) acts as a frozen feature extractor; its pooled `fire9` features pass through a small softmax head to produce class probabilities.
- **Decision-level fusion:** the final prediction is a weighted combination of the ViT and SqueezeNet probability vectors, `P_final = w·P_ViT + (1−w)·P_SqueezeNet`. **GWO optimizes the fusion weight(s)** (and may additionally select which SqueezeNet features contribute) by maximizing validation macro-F1.
- **No-compromise guarantee:** because the standalone **GWO-tuned ViT is trained and reported first as its own result**, and the fusion weight can collapse the SqueezeNet contribution to zero, the fused model's achievable performance is **≥ ViT-alone by construction** — it can tie or improve, but not degrade. The fusion weight is selected on the validation set only and reported once on the test set.
- **Realistic expectation:** since both streams describe the same leaf, gains are expected to be modest (a small improvement or a tie); the contribution is framed as complementary lightweight features, additively fused under swarm optimization.

## 4. Visualization Plan (per stage)

Each pipeline stage will produce a Matplotlib visualization for transparency and reporting:

1. **Data exploration:** bar chart of class distribution; grid of raw field sample images per class.
2. **Preprocessing:** before/after panels for segmentation, CLAHE, color constancy, and denoising.
3. **Augmentation:** side-by-side grid of an original image and its augmented variants.
4. **Optimizer behavior:** GWO **convergence curve** (best fitness / validation macro-F1 vs. iteration) and the best-found hyperparameter configuration.
5. **Training dynamics:** accuracy and loss curves (train vs. validation) per model.
6. **Evaluation:** confusion matrix heatmap per model; per-class precision/recall bars.
7. **Comparison:** grouped bar chart of all models across all metrics, including a direct **ViT-alone vs. ViT+SqueezeNet fusion** comparison; optional ROC/AUC curves.
8. **Qualitative results:** sample predictions with true vs. predicted labels (and optional ViT **attention-map** overlays to visualize attended leaf regions).

## 5. Performance Metrics

Reported for every model on the held-out test set, with **macro-averaging** emphasized due to imbalance:
- **Accuracy, Precision, Recall, F1-score** (per-class and macro/weighted averages).
- **Confusion matrix** for per-class error analysis.
- **AUC-ROC** (one-vs-rest), where applicable.
- **Efficiency metrics:** parameter count, model size, and training/inference time — relevant for deployment trade-offs.

## 6. Expected Outcome & Deliverables

- A **GWO-tuned Vision Transformer** classifier with strong macro-F1 on recent, field-collected maize leaf disease imagery, plus the optimal hyperparameter set discovered by the optimizer.
- A defensible **comparative analysis** (GWO-tuned ViT vs. MobileNetV2 vs. VGG16 vs. ResNet50) on both accuracy and efficiency, quantifying the benefit of swarm-based tuning and attention-based modeling.
- A **GWO-weighted ViT + SqueezeNet fusion** result, reported against the standalone ViT to show whether the lightweight complementary stream adds value (guaranteed not to reduce ViT-alone performance).
- Fully visualized pipeline — including field-image preprocessing and the GWO convergence curve — and a reproducible notebook positioned for lightweight deployment (mobile/web inference).

## 7. Tools & Technologies

Python, TensorFlow/Keras (with `vit-keras`) or PyTorch (with `timm`/`torchvision`) for the Vision Transformer and **SqueezeNet**, **`mealpy`** for the Grey Wolf Optimizer, OpenCV (segmentation, CLAHE, color constancy, denoising), NumPy, Pandas, scikit-learn (metrics & splitting), Matplotlib/Seaborn (visualization), executed on a GPU-enabled environment (Google Colab / Kaggle Notebooks).
