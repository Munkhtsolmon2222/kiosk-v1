"use client";

export function DeliveryAddress({
  errors,
  setErrors,
  formData,
  setFormData,
}: {
  errors: any;
  setErrors: any;
  formData: any;
  setFormData: any;
}) {
  return (
    <div className="w-full max-w-md mx-auto p-4">
      <div className="mb-4">
        <label className="block mb-1" htmlFor="address">
          Хаяг <span className="text-red-500">*</span>
        </label>
        <input
          id="address"
          value={formData.address}
          onChange={(e) =>
            setFormData({ ...formData, address: e.target.value })
          }
          required
        />
        {errors.address && (
          <p className="text-red-500 text-sm">{errors.address}</p>
        )}
      </div>

      <div className="mb-4">
        <label className="block mb-1" htmlFor="phone">
          Утас <span className="text-red-500">*</span>
        </label>
        <input
          id="phone"
          value={formData.phone}
          onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
          required
          type="tel"
        />
        {errors.phone && <p className="text-red-500 text-sm">{errors.phone}</p>}
      </div>

      <div className="mb-4">
        <label className="block mb-1" htmlFor="email">
          И-мэйл хаяг (заавал биш)
        </label>
        <input
          id="email"
          value={formData.email}
          onChange={(e) => setFormData({ ...formData, email: e.target.value })}
          type="email"
        />
        {errors.email && <p className="text-red-500 text-sm">{errors.email}</p>}
      </div>

      <div className="mb-4">
        <label className="block mb-1" htmlFor="phone2">
          Утас 2 <span className="text-red-500">*</span>
        </label>
        <input
          id="phone2"
          value={formData.phone2}
          onChange={(e) => setFormData({ ...formData, phone2: e.target.value })}
          required
          type="tel"
        />
        {errors.phone2 && (
          <p className="text-red-500 text-sm">{errors.phone2}</p>
        )}
      </div>
    </div>
  );
}
