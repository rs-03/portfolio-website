# Why I Built My Own Image Annotation Tool, Then Open-Sourced It

*Five years of computer vision work taught me that the bottleneck is never the model. It's the labeled data. So I built Reticle: a local-first, keyboard-driven annotation tool, now open source.*

## The inspiration: annotation is where CV projects go to stall

Every computer vision project I've worked on followed the same arc. The model architecture discussion takes a week. The training pipeline takes another. And then the team spends two months labeling images, because somebody has to, and the tooling makes it miserable.

The existing options each failed me in a specific way. Cloud platforms are genuinely good, but they require uploading client imagery to someone else's servers, which is a non-starter the moment an NDA is involved. Per-seat pricing punishes you for adding short-term labelers. And almost all of them are mouse-driven: click the class dropdown, select, draw, click save, click next. Those clicks feel free until you multiply them by ten thousand images.

So in early 2025 I built my own tool for my own projects, shaped by exactly the workflows I kept hitting. In 2026 I cleaned it up and open-sourced it as **Reticle**.

![Reticle's labeling interface: file browser, annotation canvas, class panel with shortcuts, and live YOLO export](https://raw.githubusercontent.com/rs-03/article-assets/main/06-reticle-labeling.png)

## Design decision 1: local-first, files as the database

Reticle runs as a FastAPI backend plus a React frontend, both on your machine. It points at a folder (or a CSV) on your disk, and it writes annotations back to your disk as JSON and YOLO OBB format. There is no database, no account, no telemetry, no upload.

That sounds like a limitation until you work with regulated or NDA-covered imagery, and then it is the entire feature. Your data never leaves your control because there is no mechanism by which it could. A side benefit: your dataset is portable. The annotations live next to the images as plain files, so version control, backup, and pipeline integration all work with tools you already have.

## Design decision 2: the keyboard is the product

The interface is built around hotkeys: number keys select classes, navigation and saving never require the mouse, and auto-save fires as you move between images. The mouse draws boxes; everything else is typing.

The math is unglamorous but decisive. If switching class plus saving plus advancing costs four seconds by mouse and under one second by keyboard, then across a 10,000-image dataset the difference is over eight working hours. Annotation tools are throughput tools, and throughput lives in the input device.

## Design decision 3: meet the ML pipeline where it is

Real datasets do not arrive as a folder of images. They arrive as a CSV with image paths, metadata columns, and sometimes pre-annotations from an earlier model run. Reticle accepts that CSV directly: it can read the image list from a column, display metadata columns in the footer while you label (useful when context like location or capture date affects the label), and load pre-annotations in YOLO OBB format as editable starting boxes.

That last part matters most. Reticle supports a pluggable inference endpoint (the repo ships an example server), so you can point it at your current model and pre-label every image. The human's job shifts from drawing boxes to correcting them, which is dramatically faster, and the corrections become exactly the training data your model needs most. That loop, label, train, pre-label, correct, retrain, is the practical engine of most successful CV projects I've seen.

## Design decision 4: boxes and keypoints

Bounding boxes cover most tasks, but my own work kept needing precise points: attachment locations, reference marks, structural landmarks. So classes in Reticle can define named keypoints with their own colors, and the same interface handles both annotation types.

![Project setup: annotation type, data source paths, and class definitions with shortcuts and keypoints](https://raw.githubusercontent.com/rs-03/article-assets/main/06-reticle-config.png)

## What it deliberately is not

Reticle is not a Labelbox competitor. There is no team management, no review queues, no consensus scoring. It is a single-operator tool that optimizes for one thing: a skilled person labeling fast on their own machine with their own data. Knowing what not to build is most of what kept it small enough to finish, and small enough that the code is readable in an afternoon.

## Try it

The repo is MIT-licensed with install scripts for Windows, Mac, and Linux: **[github.com/rs-03/Reticle](https://github.com/rs-03/Reticle)**

If you label images for a living, I would genuinely like to hear which workflow it fails on. That feedback is the roadmap.

More of my work, including live in-browser ML demos: [rs-03.github.io](https://rs-03.github.io)
