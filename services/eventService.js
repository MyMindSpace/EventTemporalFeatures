const { getFirestore } = require('../config/firebase');
const Joi = require('joi');
const { v4: uuidv4 } = require('uuid');

const eventSchema = Joi.object({
  user_id: Joi.string().required(),
  event_text: Joi.string().required().min(1),
  event_type: Joi.string().required(),
  event_subtype: Joi.string().optional(),
  parsed_date: Joi.date().iso().optional(),
  original_date_text: Joi.string().optional(),
  participants: Joi.array().items(Joi.string()).optional(),
  location: Joi.string().optional(),
  importance_score: Joi.number().min(0).max(1).optional(),
  confidence: Joi.number().min(0).max(1).optional(),
  emotional_context: Joi.string().optional() // JSON string
});

const updateEventSchema = Joi.object({
  event_text: Joi.string().min(1).optional(),
  event_type: Joi.string().optional(),
  event_subtype: Joi.string().optional(),
  parsed_date: Joi.date().iso().optional(),
  original_date_text: Joi.string().optional(),
  participants: Joi.array().items(Joi.string()).optional(),
  location: Joi.string().optional(),
  importance_score: Joi.number().min(0).max(1).optional(),
  confidence: Joi.number().min(0).max(1).optional(),
  emotional_context: Joi.string().optional() // JSON string
});

class EventService {
  constructor() {
    this.db = getFirestore();
    this.collection = this.db.collection('events_temporal_features');
  }

  async createEvent(eventData) {
    const { error, value } = eventSchema.validate(eventData);
    if (error) {
      throw new Error(`Validation error: ${error.details[0].message}`);
    }

    // Validate emotional_context if provided (should be valid JSON)
    if (value.emotional_context) {
      try {
        JSON.parse(value.emotional_context);
      } catch (e) {
        throw new Error('emotional_context must be a valid JSON string');
      }
    }

    const event = {
      event_id: uuidv4(),
      ...value,
      created_at: new Date(),
      updated_at: new Date()
    };

    // Use event_id as the document ID
    await this.collection.doc(event.event_id).set(event);
    return event;
  }

  async getEventById(eventId) {
    const doc = await this.collection.doc(eventId).get();
    
    if (!doc.exists) {
      throw new Error('Event not found');
    }

    return doc.data();
  }

  async getEventsByUserId(userId, limit = 20, offset = 0) {
    try {
      // Try with ordering first (requires index)
      const query = this.collection
        .where('user_id', '==', userId)
        .orderBy('created_at', 'desc')
        .limit(limit)
        .offset(offset);

      const snapshot = await query.get();
      
      return snapshot.docs.map(doc => doc.data());
    } catch (error) {
      // If index doesn't exist, fall back to simple query without ordering
      console.warn('Index not found, using simple query without ordering:', error.message);
      
      const simpleQuery = this.collection
        .where('user_id', '==', userId)
        .limit(limit);

      const snapshot = await simpleQuery.get();
      
      // Sort in memory (not ideal for large datasets, but works for now)
      const docs = snapshot.docs.map(doc => doc.data());
      
      // Sort by created_at descending in memory
      docs.sort((a, b) => new Date(b.created_at) - new Date(a.created_at));
      
      // Apply offset manually
      return docs.slice(offset, offset + limit);
    }
  }

  async updateEvent(eventId, updateData) {
    const { error, value } = updateEventSchema.validate(updateData);
    if (error) {
      throw new Error(`Validation error: ${error.details[0].message}`);
    }

    // Validate emotional_context if provided (should be valid JSON)
    if (value.emotional_context) {
      try {
        JSON.parse(value.emotional_context);
      } catch (e) {
        throw new Error('emotional_context must be a valid JSON string');
      }
    }

    const docRef = this.collection.doc(eventId);
    const doc = await docRef.get();

    if (!doc.exists) {
      throw new Error('Event not found');
    }

    const updatedEvent = {
      ...value,
      updated_at: new Date()
    };

    await docRef.update(updatedEvent);

    return {
      ...doc.data(),
      ...updatedEvent
    };
  }

  async deleteEvent(eventId) {
    const docRef = this.collection.doc(eventId);
    const doc = await docRef.get();

    if (!doc.exists) {
      throw new Error('Event not found');
    }

    await docRef.delete();
    return { message: 'Event deleted successfully' };
  }

  async searchEvents(userId, searchQuery, limit = 20) {
    const events = await this.getEventsByUserId(userId, limit * 2);
    
    const filteredEvents = events.filter(event => 
      event.event_text.toLowerCase().includes(searchQuery.toLowerCase()) ||
      event.event_type.toLowerCase().includes(searchQuery.toLowerCase()) ||
      (event.event_subtype && event.event_subtype.toLowerCase().includes(searchQuery.toLowerCase())) ||
      (event.location && event.location.toLowerCase().includes(searchQuery.toLowerCase())) ||
      (event.participants && event.participants.some(participant => 
        participant.toLowerCase().includes(searchQuery.toLowerCase())
      ))
    );

    return filteredEvents.slice(0, limit);
  }

  async getEventsByType(userId, eventType, limit = 20) {
    try {
      const query = this.collection
        .where('user_id', '==', userId)
        .where('event_type', '==', eventType)
        .limit(limit);

      const snapshot = await query.get();
      return snapshot.docs.map(doc => doc.data());
    } catch (error) {
      console.error('Error getting events by type:', error.message);
      throw new Error('Failed to retrieve events by type');
    }
  }

  async getEventsByDateRange(userId, startDate, endDate, limit = 20) {
    try {
      const query = this.collection
        .where('user_id', '==', userId)
        .where('parsed_date', '>=', new Date(startDate))
        .where('parsed_date', '<=', new Date(endDate))
        .limit(limit);

      const snapshot = await query.get();
      return snapshot.docs.map(doc => doc.data());
    } catch (error) {
      console.error('Error getting events by date range:', error.message);
      throw new Error('Failed to retrieve events by date range');
    }
  }
}

module.exports = EventService;
