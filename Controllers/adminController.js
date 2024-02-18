const express = require("express");
const factoryFunc = require("./../factoryFunc/factoryfuntions");
const adminModel = require("./../models/adminModel");

exports.newAdmin = factoryFunc.createUser(
  adminModel,
  factoryFunc.generateToken
);

exports.login = factoryFunc.login(adminModel, factoryFunc.generateToken);

exports.renderLogin = factoryFunc.renderLoginPage;

exports.protect = factoryFunc.protect(adminModel);
exports.viewProfile = factoryFunc.viewProfile(adminModel);
