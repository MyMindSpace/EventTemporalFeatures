const express = require('express');
const EventService = require('../services/eventService');

const router = express.Router();
const eventService = new EventService();

// Base route - API info
router.get('/', (req, res) => {
  res.json({
    success: true,
    message: 'Events Temporal Features CRUD API',
    version: '1.0.0',
    endpoints: {
      'POST /': 'Create a new event',
      'GET /:id': 'Get event by ID',
      'GET /user/:userId': 'Get events by user ID',
      'PUT /:id': 'Update event',
      'DELETE /:id': 'Delete event',
      'GET /user/:userId/search?q=query': 'Search events',
      'GET /user/:userId/type/:eventType': 'Get events by type',
      'GET /user/:userId/date-range?start=date&end=date': 'Get events by date range'
    }
  });
});

// Create a new event
router.post('/', async (req, res) => {
  try {
    const event = await eventService.createEvent(req.body);
    res.status(201).json({
      success: true,
      data: event
    });
  } catch (error) {
    res.status(400).json({
      success: false,
      error: error.message
    });
  }
});

// Get event by ID
router.get('/:id', async (req, res) => {
  try {
    const event = await eventService.getEventById(req.params.id);
    res.json({
      success: true,
      data: event
    });
  } catch (error) {
    const status = error.message === 'Event not found' ? 404 : 400;
    res.status(status).json({
      success: false,
      error: error.message
    });
  }
});

// Get events by user ID
router.get('/user/:userId', async (req, res) => {
  try {
    const { limit = 20, offset = 0 } = req.query;
    const events = await eventService.getEventsByUserId(
      req.params.userId,
      parseInt(limit),
      parseInt(offset)
    );
    res.json({
      success: true,
      data: events,
      count: events.length
    });
  } catch (error) {
    res.status(400).json({
      success: false,
      error: error.message
    });
  }
});

// Update event
router.put('/:id', async (req, res) => {
  try {
    const event = await eventService.updateEvent(req.params.id, req.body);
    res.json({
      success: true,
      data: event
    });
  } catch (error) {
    const status = error.message === 'Event not found' ? 404 : 400;
    res.status(status).json({
      success: false,
      error: error.message
    });
  }
});

// Delete event
router.delete('/:id', async (req, res) => {
  try {
    const result = await eventService.deleteEvent(req.params.id);
    res.json({
      success: true,
      data: result
    });
  } catch (error) {
    const status = error.message === 'Event not found' ? 404 : 400;
    res.status(status).json({
      success: false,
      error: error.message
    });
  }
});

// Search events
router.get('/user/:userId/search', async (req, res) => {
  try {
    const { q: searchQuery, limit = 20 } = req.query;
    
    if (!searchQuery) {
      return res.status(400).json({
        success: false,
        error: 'Search query is required'
      });
    }

    const events = await eventService.searchEvents(
      req.params.userId,
      searchQuery,
      parseInt(limit)
    );
    
    res.json({
      success: true,
      data: events,
      count: events.length
    });
  } catch (error) {
    res.status(400).json({
      success: false,
      error: error.message
    });
  }
});

// Get events by type
router.get('/user/:userId/type/:eventType', async (req, res) => {
  try {
    const { limit = 20 } = req.query;
    const events = await eventService.getEventsByType(
      req.params.userId,
      req.params.eventType,
      parseInt(limit)
    );
    
    res.json({
      success: true,
      data: events,
      count: events.length
    });
  } catch (error) {
    res.status(400).json({
      success: false,
      error: error.message
    });
  }
});

// Get events by date range
router.get('/user/:userId/date-range', async (req, res) => {
  try {
    const { start, end, limit = 20 } = req.query;
    
    if (!start || !end) {
      return res.status(400).json({
        success: false,
        error: 'Start and end dates are required'
      });
    }

    const events = await eventService.getEventsByDateRange(
      req.params.userId,
      start,
      end,
      parseInt(limit)
    );
    
    res.json({
      success: true,
      data: events,
      count: events.length
    });
  } catch (error) {
    res.status(400).json({
      success: false,
      error: error.message
    });
  }
});

module.exports = router;
