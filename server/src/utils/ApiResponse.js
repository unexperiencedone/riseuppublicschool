/** Uniform success envelope used by every controller. */
export const ok = (res, data = null, message = 'OK', meta = undefined) =>
  res.status(200).json({ success: true, message, data, ...(meta ? { meta } : {}) });

export const created = (res, data = null, message = 'Created') =>
  res.status(201).json({ success: true, message, data });

export const noContent = (res) => res.status(204).send();

export const paginated = (res, items, { page, limit, total }, message = 'OK') =>
  res.status(200).json({
    success: true,
    message,
    data: items,
    meta: {
      page, limit, total,
      totalPages: Math.max(1, Math.ceil(total / limit)),
      hasNext: page * limit < total,
      hasPrev: page > 1,
    },
  });
