# SARA: Smart Analysis and Research Assistant
![Java](https://img.shields.io/badge/Backend-Java%2021-blue)
![Angular](https://img.shields.io/badge/Frontend-Angular%2019-red)
![PostgreSQL](https://img.shields.io/badge/Database-PostgreSQL-blue)
![Dockerized](https://img.shields.io/badge/Deployment-Docker-green)
![Status](https://img.shields.io/badge/Status-Production%20Ready-brightgreen)



SARA is a modular, microservice-based platform designed to unify real-time sensor streams, historical data visualization, and custom dataset analysis under a single, extensible interface. Developed in the context of the "Thakai Daigaku"(Smart Campus) collaboration between ISTIC (Tunisia) and the University of Aizu (Japan), SARA empowers researchers to explore dynamic environments—smart classrooms, museums, cafeterias—and gain data-driven insights with low-latency performance.

---

## Table of Contents

1. [Features](#features)
2. [Architecture](#architecture)
3. [Prerequisites](#prerequisites)


4. [Usage](#usage)

   * [Authentication](#authentication)
   * [Real-Time Monitoring](#real-time-monitoring)
   * [Historical Data Visualization](#historical-data-visualization)
   * [Custom Dataset Management](#custom-dataset-management)
   * [Admin Reference Data Management](#admin-reference-data-management)
5. [Development](#development)

   * [Project Structure](#project-structure)
   * [Extending SARA](#extending-sara)

---

## Features

* **Real-Time Monitoring**: Live sensor streams via Server-Sent Events; dynamic controls for frequency, aggregation metrics, and pause/resume.
* **Historical Visualization**: Drill-down and roll-up through minute, hourly, daily, monthly, and yearly resolutions; multi-sensor correlation; statistical metrics.
* **Custom Datasets**: Upload JSON/CSV with schema validation; define visibility and collaborators; integrate into the same visualization pipeline.
* **User Management**: JWT-based authentication (access + refresh tokens); role-based access control (Researcher, Admin).
* **Admin Dashboard**: CRUD management of reference data (sites, locations, sensor types, modules).
* **Scalable Microservices**: Separate Spring Boot gateway, FastAPI real-time and historical-processing services; Redis caching; PostgreSQL persistence.
### Use Case Diagram
<img width="1472" height="1080" alt="SARA " src="https://github.com/user-attachments/assets/d008bcad-d99f-4c21-af04-29a1456d05b4" />

---

## Architecture

### Components Diagram

<img width="814" height="519" alt="componentdiagram" src="https://github.com/user-attachments/assets/35be32d9-8dcd-48a8-9237-aa9a571d9424" />

---



## Usage

### Authentication

1. **Sign Up**: Create a new account at `/auth/signup`.
2. **Sign In**: Obtain JWT access & refresh tokens at `/auth/login`.
3. **Token Refresh**: Sessions are maintained through a token refresh mechanism.
<img width="1919" height="904" alt="auth_login" src="https://github.com/user-attachments/assets/7755b2da-73b5-4eaa-9ba5-08e235ed738e" />



### Real-Time Monitoring

* Navigate to the **Real-Time** tab.
* Select facility, module, sensor type.
* Adjust update frequency and aggregation metric in the control panel.
* Streams update via SSE with minimal latency.
<img width="1899" height="906" alt="Capture d'écran 2025-05-22 180949" src="https://github.com/user-attachments/assets/1b8dd963-6608-4da7-af9e-2859d82e7949" />

<img width="1827" height="904" alt="realtime2" src="https://github.com/user-attachments/assets/48e69c11-c0d8-4d9e-97fa-6fb0fd1c495c" />
<img width="1898" height="904" alt="Capture d'écran 2025-05-31 113914" src="https://github.com/user-attachments/assets/0d73ae65-ea14-4b71-94f5-3f9dc9e2fefd" />


### Historical Data Visualization

* Go to the **Historical** tab.
* Choose a data source (sensor network or custom dataset).
* Configure time range, resolution, and metrics.
* Charts support drill-down/roll-up and multi-sensor comparisons.
<img width="1899" height="904" alt="Capture d'écran 2025-05-22 143431" src="https://github.com/user-attachments/assets/f734f8ea-e956-4099-8658-3ab4702c00d9" />

<img width="1895" height="901" alt="hist3" src="https://github.com/user-attachments/assets/affa53a9-cf2f-4f90-9f4d-cdb43cf65660" />
<img width="1892" height="903" alt="example-historique" src="https://github.com/user-attachments/assets/cc7d21c8-10fc-463d-aeb7-3367531ece80" />
<img width="1892" height="906" alt="cross-type" src="https://github.com/user-attachments/assets/5100b437-7476-4b8f-8a41-0dde2b4327c4" />
<img width="1890" height="905" alt="Capture d'écran 2025-05-25 024341" src="https://github.com/user-attachments/assets/142904c5-56fb-4cea-918f-26dc7a618a3e" />


### Custom Dataset Management

* Upload JSON or CSV with schema via **Datasets** > **Create**.
* Define visibility (Private, Public, Restricted) and collaborators.
* Schema validation ensures data integrity.
* View and delete datasets in the **Datasets** dashboard.
<img width="2048" height="1137" alt="1 (2)" src="https://github.com/user-attachments/assets/3a79ce75-d184-418d-b588-650a438e7287" />
<img width="1898" height="906" alt="schema-validation" src="https://github.com/user-attachments/assets/feacfc5c-411e-4081-9b56-30e8678e242d" />
<img width="1893" height="904" alt="dataset-preview" src="https://github.com/user-attachments/assets/874ff6b0-cc7a-4436-ac4f-8bb3e7c58625" />

<img width="1914" height="903" alt="dataset-listings" src="https://github.com/user-attachments/assets/e7d90adb-268d-41ca-812b-73ef57f40721" />
<img width="1895" height="902" alt="delete-dataset" src="https://github.com/user-attachments/assets/5b66fe5f-d7b3-4dd6-bbfe-7279bf22b366" />

### Admin Reference Data Management

* Log in as an Admin.
* Access the **Admin** dashboard at `/admin`.
* Perform CRUD on Sites, Locations, Sensor Modules, and Types.
<img width="2048" height="958" alt="1 (3)" src="https://github.com/user-attachments/assets/f24fa579-1963-4c36-9e98-829f8b629bd7" />


---

## Development

### Project Structure

```
/angular            # Angular frontend
/springboot/sara    # Spring Boot gateway
/python-ms          # FastAPI microservices
  /historical_processing
  /realtime_monitoring
/docker-compose.yml
```

### Extending SARA
SARA is highly extensible thanks to its modular architecture

1. **New Microservice**: Implement your service and expose endpoints.
2. **Gateway**: Update Spring Boot configuration to route requests.
3. **UI**: Add new interface components in `angular/src/app`.
4. **Deploy**: Add service to `docker-compose.yml` and rebuild.

---
> **Deep Dive & Algorithms**  
> For a comprehensive discussion of the overall architecture, the algorithmic design of the historical‑processing microservice, and the underlying rationale, please consult the graduation thesis (located at `Documentation/Graduation_Thesis.pdf`).





*Developed by Melik Hajlawi & Yosr Derbeli — Academic Year 2024–2025*
