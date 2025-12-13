import Image from '../models/Image.model.js';
import pool from '../config/postgres.js';

export const getAllRecords = async (req, res) => {
  try {
    const result = await pool.query(
      'SELECT id, image_id, keypoints_json, created_at FROM pose_keypoints ORDER BY created_at DESC'
    );

    const records = await Promise.all(
      result.rows.map(async (row) => {
        const image = await Image.findById(row.image_id);
        return {
          id: row.id,
          imageId: row.image_id,
          keypoints: row.keypoints_json,
          createdAt: row.created_at,
          imageMetadata: image ? {
            filename: image.filename,
            mimetype: image.mimetype,
            size: image.size
          } : null
        };
      })
    );

    res.json({
      success: true,
      message: 'Records retrieved successfully',
      data: records
    });
  } catch (error) {
    console.error('Error fetching records:', error);
    res.status(500).json({
      success: false,
      message: 'Error fetching records',
      data: null
    });
  }
};

export const getRecordById = async (req, res) => {
  try {
    const { id } = req.params;

    const result = await pool.query(
      'SELECT * FROM pose_keypoints WHERE id = $1',
      [id]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({
        success: false,
        message: 'Record not found',
        data: null
      });
    }

    const record = result.rows[0];
    const image = await Image.findById(record.image_id);

    if (!image) {
      return res.status(404).json({
        success: false,
        message: 'Associated image not found',
        data: null
      });
    }

    res.json({
      success: true,
      message: 'Record retrieved successfully',
      data: {
        id: record.id,
        imageId: record.image_id,
        keypoints: record.keypoints_json,
        createdAt: record.created_at,
        image: {
          filename: image.filename,
          mimetype: image.mimetype,
          size: image.size,
          data: image.data.toString('base64')
        }
      }
    });
  } catch (error) {
    console.error('Error fetching record:', error);
    res.status(500).json({
      success: false,
      message: 'Error fetching record',
      data: null
    });
  }
};

export const updateRecord = async (req, res) => {
  try {
    const { id } = req.params;
    const { tags, description } = req.body;

    const checkResult = await pool.query(
      'SELECT * FROM pose_keypoints WHERE id = $1',
      [id]
    );

    if (checkResult.rows.length === 0) {
      return res.status(404).json({
        success: false,
        message: 'Record not found',
        data: null
      });
    }

    const record = checkResult.rows[0];
    const image = await Image.findById(record.image_id);

    if (image && (tags || description)) {
      if (tags) image.tags = tags;
      if (description) image.description = description;
      await image.save();
    }

    res.json({
      success: true,
      message: 'Record updated successfully',
      data: {
        id: record.id,
        imageId: record.image_id,
        tags,
        description
      }
    });
  } catch (error) {
    console.error('Error updating record:', error);
    res.status(500).json({
      success: false,
      message: 'Error updating record',
      data: null
    });
  }
};

export const deleteRecord = async (req, res) => {
  try {
    const { id } = req.params;

    const result = await pool.query(
      'SELECT image_id FROM pose_keypoints WHERE id = $1',
      [id]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({
        success: false,
        message: 'Record not found',
        data: null
      });
    }

    const imageId = result.rows[0].image_id;

    await pool.query('DELETE FROM pose_keypoints WHERE id = $1', [id]);
    await Image.findByIdAndDelete(imageId);

    res.json({
      success: true,
      message: 'Record deleted successfully',
      data: { id, imageId }
    });
  } catch (error) {
    console.error('Error deleting record:', error);
    res.status(500).json({
      success: false,
      message: 'Error deleting record',
      data: null
    });
  }
};
