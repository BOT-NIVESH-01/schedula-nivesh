# Schedula System Analysis

## Overview

Schedula is a healthcare appointment scheduling platform that enables patients to discover doctors, book appointments, and receive notifications while allowing doctors to manage their profiles, availability, and appointments.

---

## User Roles

### Patient

- Register/Login
- Search Doctors
- View Doctor Profile
- Book Appointment
- Cancel Appointment
- Reschedule Appointment
- Receive Notifications

### Doctor

- Register/Login
- Complete Professional Profile
- Manage Availability Slots
- View Scheduled Appointments
- Complete Consultations

---

## Modules

- Authentication
- User Management
- Doctor Management
- Patient Management
- Slot Management
- Appointment Management
- Notification Management

---

## Database Design

The database follows a normalized relational model.

- User stores authentication details.
- DoctorProfile and PatientProfile extend User through one-to-one relationships.
- Doctors manage multiple appointment slots.
- Patients reserve slots through appointments.
- Notifications are linked to users.
- Specializations are stored separately to avoid duplicate data.