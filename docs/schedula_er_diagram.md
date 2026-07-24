flowchart TD

    User[User]
    DoctorProfile[Doctor Profile]
    PatientProfile[Patient Profile]
    Notification[Notification]
    Slot[Slot]
    Appointment[Appointment]
    Specialization[Specialization]

    User -->|is a| DoctorProfile
    User -->|is a| PatientProfile
    User -->|receives| Notification
    DoctorProfile -->|manages| Slot
    DoctorProfile -->|attends| Appointment
    PatientProfile -->|books| Appointment
    Slot -->|reserved for| Appointment
    DoctorProfile -->|has| Specialization

    UserDetails["User
    --------------------
    id (PK)
    email
    password
    first_name
    last_name
    role
    created_at
    updated_at"]

    DoctorDetails["DoctorProfile
    --------------------
    id (PK)
    user_id (FK)
    specialization_id (FK)
    bio
    hospital_name
    experience_years
    consultation_fee
    updated_at"]

    PatientDetails["PatientProfile
    --------------------
    id (PK)
    user_id (FK)
    date_of_birth
    gender
    blood_group
    medical_history
    updated_at"]

    SlotDetails["Slot
    --------------------
    id (PK)
    doctor_id (FK)
    start_time
    end_time
    status
    date
    updated_at"]

    AppointmentDetails["Appointment
    --------------------
    id (PK)
    patient_id (FK)
    doctor_id (FK)
    slot_id (FK)
    status
    reason_for_visit
    notes
    created_at
    updated_at"]

    NotificationDetails["Notification
    --------------------
    id (PK)
    user_id (FK)
    title
    message
    type
    is_read
    created_at
    updated_at"]

    SpecializationDetails["Specialization
    --------------------
    id (PK)
    name
    description"]

    User --- UserDetails
    DoctorProfile --- DoctorDetails
    PatientProfile --- PatientDetails
    Slot --- SlotDetails
    Appointment --- AppointmentDetails
    Notification --- NotificationDetails
    Specialization --- SpecializationDetails