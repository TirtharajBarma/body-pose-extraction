import { spawn } from 'child_process';
import fs from 'fs';
import path from 'path';
import Image from '../models/Image.model.js';
import pool from '../config/postgres.js';

export const extractPose = async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({
        success: false,
        message: 'No image file provided',
        data: null
      });
    }

    const imagePath = req.file.path;
    
    // Call Python script to extract pose
    const python = spawn('python3', ['src/utils/extractPose.py', imagePath]);
    
    let pythonOutput = '';
    let pythonError = '';

    python.stdout.on('data', (data) => {
      pythonOutput += data.toString();
    });

    python.stderr.on('data', (data) => {
      pythonError += data.toString();
    });

    python.on('close', async (code) => {
      try {
        if (code !== 0) {
          fs.unlinkSync(imagePath);
          return res.status(500).json({
            success: false,
            message: 'Pose extraction failed',
            data: { error: pythonError }
          });
        }

        const keypoints = JSON.parse(pythonOutput);

        // Store image in MongoDB
        const imageBuffer = fs.readFileSync(imagePath);
        const imageDoc = new Image({
          data: imageBuffer,
          mimetype: req.file.mimetype,
          filename: req.file.filename,
          size: req.file.size
        });
        await imageDoc.save();

        // Store keypoints in PostgreSQL
        const result = await pool.query(
          'INSERT INTO pose_keypoints (image_id, keypoints_json) VALUES ($1, $2) RETURNING id',
          [imageDoc._id.toString(), JSON.stringify(keypoints)]
        );

        // Clean up uploaded file
        fs.unlinkSync(imagePath);

        res.status(201).json({
          success: true,
          message: 'Pose extracted successfully',
          data: {
            imageId: imageDoc._id,
            recordId: result.rows[0].id,
            keypoints
          }
        });
      } catch (error) {
        if (fs.existsSync(imagePath)) {
          fs.unlinkSync(imagePath);
        }
        console.error('Error processing pose extraction:', error);
        res.status(500).json({
          success: false,
          message: 'Error processing pose extraction',
          data: null
        });
      }
    });
  } catch (error) {
    console.error('Error in extractPose:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error',
      data: null
    });
  }
};
