"use client";

import Link from 'next/link';
import React, { useEffect, useState } from 'react';

export interface ShippingService {
  _id: string;
  name: string;
  price: number;
  type: string;
  capacity: string;
  image: string;
  transitTime: string;
  includes: string;
}

const Containers = () => {
  const [selectedService, setSelectedService] = useState<ShippingService | null>(null);
  const [filter, setFilter] = useState('all');
  const [services, setServices] = useState<ShippingService[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchServices = async () => {
      try {
        const response = await fetch('/api/containers');
        if (!response.ok) throw new Error('Could not load services');
        const data = await response.json();
        setServices(data.containers || []);
      } catch (error) {
        console.error(error);
      } finally {
        setLoading(false);
      }
    };
    fetchServices();
  }, []);

  const filteredServices = filter === 'all'
    ? services
    : services.filter(service => service.type === filter);

  return (
    <div className="investment-page">
      <h1>Container Shipping Services</h1>
      <p className="page-description">
        Reliable ocean freight for commercial cargo. Choose the container size that fits your shipment and request a tailored shipping quote.
      </p>

      <div className="filters">
        <button className={filter === 'all' ? 'filter-btn active' : 'filter-btn'} onClick={() => setFilter('all')}>All Services</button>
        <button className={filter === '20ft Container' ? 'filter-btn active' : 'filter-btn'} onClick={() => setFilter('20ft Container')}>20ft Container</button>
        <button className={filter === '40ft Container' ? 'filter-btn active' : 'filter-btn'} onClick={() => setFilter('40ft Container')}>40ft Container</button>
      </div>

      {loading ? (
        <p className="page-description">Loading shipping services…</p>
      ) : filteredServices.length === 0 ? (
        <p className="page-description">No shipping services are available at the moment.</p>
      ) : (
        <div className="properties-grid">
          {filteredServices.map(service => (
            <div key={service._id} className="property-card">
              <div className="property-image">
                <img src={service.image} alt={service.name} />
                <div className="property-type">{service.type}</div>
              </div>
              <div className="property-details">
                <h3>{service.name}</h3>
                <div className="property-features">
                  <span><h3>Capacity:</h3> {service.capacity}</span>
                  <span><h3>Service:</h3> Full-container ocean freight</span>
                  <span><h3>Includes:</h3> {service.includes}</span>
                </div>
                <div className="property-financials">
                  <div className="property-price">From ${service.price.toLocaleString()}</div>
                  <div className="property-return">{service.transitTime}</div>
                </div>
                <button className="inquiry-btn" onClick={() => setSelectedService(service)}>Request a Quote</button>
              </div>
            </div>
          ))}
        </div>
      )}

      {selectedService && (
        <div className="modal-overlay">
          <div className="modal">
            <h2>Request a Shipping Quote</h2>
            <p>You&apos;re requesting a quote for <strong>{selectedService.name}</strong>.</p>
            <p>Our shipping team will confirm the route, schedule, and final destination charges.</p>
            <div className="modal-actions">
              <button onClick={() => setSelectedService(null)}>Cancel</button>
              <Link href="https://wa.me/+16815054209" target="_blank"><button className="primary">Contact Shipping Team</button></Link>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Containers;
