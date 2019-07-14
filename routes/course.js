const express = require('express');
const router = express.Router();
const Course = require('../models').Course;
const User = require('../models').User;
const Sequelize = require('sequelize');
const authenticate = require('./auth');
/* GET course list. */
router.get('/', (req, res, next) => {
	//Find all courses
	Course.findAll({
		//This is all the course data
			attributes: ['id', 'title', 'description', 'estimatedTime', 'materialsNeeded', 'userId'],
			include: [{
				//this is the user data associated with each course
				model: User,
				attributes: ['id', 'firstName', 'lastName', 'emailAddress']
			}]
		}).then(courses => {
			res.status(200);
			//retrieve courses in JSON format
			res.json({
				courses
			});
		})
		//Catch the errors
		.catch(err => {
			err.status = 400;
			next(err);
		});
});
/* GET course by ID. */
router.get('/:id', (req, res, next) => {
	//get course
	Course.findOne({
		where: {
			id: req.params.id
		},
		attributes: ['id', 'title', 'description', 'estimatedTime', 'materialsNeeded', 'userId'],
		include: [{
			model: User,
			attributes: ['id', 'firstName', 'lastName', 'emailAddress']
		}]
	}).then(course => {
		//Checks for match for course
		if (course) {
			res.status(200);
			res.json({
				course
			});
		} else {
			const err = new Error('This course does not exist.');
			err.status = 400;
			next(err);
		}
	});
});
/* POST create new course. */
router.post('/', authenticate, (req, res, next) => {
	if (!req.body.title && !req.body.description) {
		const err = new Error('Please enter a title and a description.');
		err.status = 400;
		next(err);
	} else if (!req.body.title) {
		const err = new Error('Please enter a title.');
		err.status = 400;
		next(err);
	} else if (!req.body.description) {
		const err = new Error('Please enter a description.');
		err.status = 400;
		next(err);
	} else {
		Course.findOne({
			where: {
				title: req.body.title
			}
		}).then(title => {
			if (title) {
				const err = new Error('This course already exists.');
				err.status = 400;
				next(err);
			} else {
				Course.create(req.body).then(course => {
						res.location(`/api/courses/${course.id}`);
						res.status(201).end();
					})
					//Catch errors
					.catch(err => {
						err.status = 400;
						next(err);
					});
			}
		})
	}
});
/* PUT update course. */
router.put('/:id', authenticate, (req, res, next) => {
	const user = req.currentUser;
	//If title is left null
	if (!req.body.title && !req.body.description) {
		const err = new Error('Please enter a title and a description.');
		err.status = 400;
		next(err);
	} else if (!req.body.title) {
		const err = new Error('Please enter a title.');
		err.status = 400;
		next(err);
	} else if (!req.body.description) {
		const err = new Error('Please enter a description.');
		err.status = 400;
		next(err);
	} else {
		Course.findOne({
				where: {
					id: req.body.id
				}
			}).then(course => {
				if (!course) {
					res.status(404).json({
						message: 'Course Not Found'
					});
				} else if (course) {
					if (user.id === course.userId) {
						const updateCourse = {
							id: req.body.id,
							title: req.body.title,
							description: req.body.description,
							estimatedTime: req.body.estimatedTime,
							materialsNeeded: req.body.materialsNeeded,
							userId: req.currentUser.id
						};
						course.update(req.body);
					} else {
						res.location('/').status(403).json("You do not have permissions to update this course");
					}
				}
			}).then(() => {
				res.status(204).end();
			})
			//Catch any errors
			.catch(err => {
				err.status = 400;
				next(err);
			});
	}
});
/* Delete individual course. */
router.delete('/:id', authenticate, (req, res, next) => {
  const user = req.currentUser;
	//Find one course to delete
	Course.findOne({
			where: {
				id: req.params.id
			}
		}).then(course => {
			//If course doesn't exist
			if (!course) {
				//Show error
				res.status(404).json({
					message: 'Course Not Found'
				});
			} else if (user.id === course.userId) {
				//Delete the course
				return course.destroy();
			} else{
        res.location('/').status(403).json("You do not have permissions to delete this course");
      }
		}).then(() => {
			//Return no content and end the request
			res.status(204).end();
		})
		//Catch the errors
		.catch(err => {
			err.status = 400;
			next(err);
		});
});
module.exports = router;