"use client";

import { useAuth } from '@clerk/nextjs';
import { useEffect, useState } from 'react';
import { isAdmin } from '@/lib/admin';
import type { ShippingService } from '@/app/(investment)/containers/page';

type ServiceForm = Omit<ShippingService, '_id'>;

const emptyService: ServiceForm = {
  name: '', price: 0, type: '20ft Container', capacity: '', image: '', transitTime: 'Estimated transit: 7–14 days', includes: '',
};

export default function ContainerManagementPage() {
  const { userId, isLoaded } = useAuth();
  const [services, setServices] = useState<ShippingService[]>([]);
  const [form, setForm] = useState<ServiceForm>(emptyService);
  const [selectedImage, setSelectedImage] = useState<File | null>(null);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState('');

  const loadServices = async () => {
    const response = await fetch('/api/containers');
    const data = await response.json();
    if (!response.ok) throw new Error(data.error || 'Could not load services');
    setServices(data.containers || []);
  };

  useEffect(() => {
    if (!isLoaded || !isAdmin(userId)) return;
    loadServices().catch(error => setMessage(error.message)).finally(() => setLoading(false));
  }, [isLoaded, userId]);

  const updateField = <K extends keyof ServiceForm>(field: K, value: ServiceForm[K]) => {
    setForm(current => ({ ...current, [field]: value }));
  };

  const uploadImage = async (file: File) => {
    const data = new FormData();
    data.append('image', file);
    const response = await fetch('/api/containers/upload', { method: 'POST', body: data });
    const result = await response.json();
    if (!response.ok) throw new Error(result.error || 'Image upload failed');
    return result.url as string;
  };

  const saveService = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setSaving(true);
    setMessage('');
    try {
      let image = form.image;
      if (selectedImage) {
        setMessage('Uploading image to Cloudinary…');
        image = await uploadImage(selectedImage);
      }
      if (!image) throw new Error('Please select a container image.');

      const response = await fetch(editingId ? `/api/containers/${editingId}` : '/api/containers', {
        method: editingId ? 'PATCH' : 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ ...form, image }),
      });
      const result = await response.json();
      if (!response.ok) throw new Error(result.error || 'Could not save service');
      await loadServices();
      setForm(emptyService);
      setSelectedImage(null);
      setEditingId(null);
      setMessage(editingId ? 'Shipping service updated.' : 'Shipping service created.');
    } catch (error) {
      setMessage(error instanceof Error ? error.message : 'Could not save service');
    } finally {
      setSaving(false);
    }
  };

  const editService = (service: ShippingService) => {
    const { _id, ...serviceForm } = service;
    setEditingId(_id);
    setForm(serviceForm);
    setSelectedImage(null);
    setMessage('Editing service. Make changes and save.');
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const deleteService = async (id: string) => {
    if (!window.confirm('Delete this shipping service? This cannot be undone.')) return;
    setSaving(true);
    try {
      const response = await fetch(`/api/containers/${id}`, { method: 'DELETE' });
      const result = await response.json();
      if (!response.ok) throw new Error(result.error || 'Could not delete service');
      await loadServices();
      setMessage('Shipping service deleted.');
    } catch (error) {
      setMessage(error instanceof Error ? error.message : 'Could not delete service');
    } finally {
      setSaving(false);
    }
  };

  if (!isLoaded) return <div className="dashboard"><p>Loading…</p></div>;
  if (!isAdmin(userId)) return <div className="dashboard"><h1>Access denied</h1><p>This page is only available to administrators.</p></div>;

  return (
    <div className="dashboard container-admin">
      <div className="transfer_p-top"><h1>Container Management</h1><p>Create, edit, or remove the shipping services shown on the Containers page.</p></div>
      <form className={`container-admin-form ${editingId ? 'is-editing' : ''}`} onSubmit={saveService}>
        <h2>{editingId ? 'Edit shipping service' : 'Add shipping service'}</h2>
        <div className="container-admin-grid">
          <label>Service name<input required value={form.name} onChange={e => updateField('name', e.target.value)} placeholder="20ft Standard Container Shipping" /></label>
          <label>Starting price (USD)<input required min="0" step="1" type="number" value={form.price} onChange={e => updateField('price', Number(e.target.value))} /></label>
          <label>Container type<input required value={form.type} onChange={e => updateField('type', e.target.value)} placeholder="20ft Container" /></label>
          <label>Transit time<input required value={form.transitTime} onChange={e => updateField('transitTime', e.target.value)} /></label>
          <label className="container-admin-full">Capacity<textarea required value={form.capacity} onChange={e => updateField('capacity', e.target.value)} placeholder="Up to 28 m³ · approx. 10 standard pallets" /></label>
          <label className="container-admin-full">What&apos;s included<textarea required value={form.includes} onChange={e => updateField('includes', e.target.value)} placeholder="Ocean freight, export documentation and shipment tracking" /></label>
          <label className="container-admin-full">Container image (uploads to Cloudinary when saved)<input required={!editingId && !form.image} type="file" accept="image/*" disabled={saving} onChange={e => setSelectedImage(e.target.files?.[0] || null)} /><small>{selectedImage ? `${selectedImage.name} will be uploaded when you save.` : editingId ? 'Leave empty to keep the current image.' : 'Choose an image to upload with this service.'}</small></label>
        </div>
        {form.image && <img className="container-admin-preview" src={form.image} alt="Container service preview" />}
        {message && <p className="container-admin-message">{message}</p>}
        <div className="container-admin-actions">
          <button className="submit-btn" disabled={saving}>{saving ? 'Saving…' : editingId ? 'Save changes' : 'Create shipping service'}</button>
          {editingId && <button type="button" className="filter-btn" onClick={() => { setEditingId(null); setForm(emptyService); }}>Cancel edit</button>}
        </div>
      </form>

      <section className="container-admin-list"><h2>Current services</h2>{loading ? <p>Loading services…</p> : services.map(service => (
        <article key={service._id}>
          <img src={service.image} alt="" />
          <div><h3>{service.name}</h3><p>{service.type} · From ${service.price.toLocaleString()} · {service.transitTime}</p></div>
          <div className="container-admin-actions"><button className="filter-btn" onClick={() => editService(service)}>Edit</button><button className="container-admin-delete" disabled={saving} onClick={() => deleteService(service._id)}>Delete</button></div>
        </article>
      ))}</section>
    </div>
  );
}
