const morgan = require('morgan')
const logger = require('./logger')
const jwt = require('jsonwebtoken')
const User = require('../models/user')


const requestLogger = morgan(function(tokens, request, response) {
  return process.env.NODE_ENV === 'test' ? null : [
    tokens.method(request, response),
    tokens.url(request, response),
    tokens.status(request, response),
    tokens.res(request, response, 'content-length'),
    '-',
    tokens['response-time'](request, response), 'ms',
    JSON.stringify(request.body)
  ].join(' ')
})

const unknownEndpoint = (request, response) => {
  response.status(404).send({
    error: 'unknown endpoint'
  })
}

const errorHandler = (error, request, response, next) => {
  logger.error(error.message)

  if (error.name === 'CastError') {
    return response.status(400).send({
      error: 'malformatted id'
    })
  } else if (error.name === 'ValidationError') {
    return response.status(400).json({
      error: error.message
    })
  } else if (error.name ===  'JsonWebTokenError') {
    return response.status(401).json(
      { error: error.message }
    )
  } else if (error.name === 'TokenExpiredError') {
    return response.status(401).json({
      error: 'token expired'
    })
  }

  next(error)
}


const tokenExtractor = (request, response, next) => {
  const authorization = request.get('authorization')

  if (authorization && (authorization.startsWith('bearer ') || authorization.startsWith('Bearer '))) {
    request.token = authorization.replace('bearer ', '').replace('Bearer ', '')
  } else {
    request.token = null
  }

  return next()
}


const userExtractor = async (request, response, next) => {
  if (request.token === null) {
    request.user = null
  } else {
    const decodedToken = jwt.verify(request.token, process.env.SECRET)

    if (!decodedToken || !decodedToken.id) {
      request.user = null
    } else {
      request.user = await User.findById(decodedToken.id)
      // User.findById(decodedToken.id).then(u => request.user = u)
    }
  }

  return next()
}


const userValidator = (request, response, next) => {
  if (request.user === null) {
    return response.status(401).json({ error: 'token invalid' })
  }

  return next()
}


module.exports = {
  requestLogger,
  unknownEndpoint,
  errorHandler,
  tokenExtractor,
  userExtractor,
  userValidator
}