import AuditLog from '../models/AuditLog.js';
import logger from '../config/logger.js';

/** Fire-and-forget audit trail for write operations. */
export const recordAudit = async (req, { action, entity, entityId, before, after }) => {
  try {
    await AuditLog.create({
      actor: req.user?._id,
      actorRole: req.user?.role,
      action, entity, entityId: String(entityId || ''),
      before, after,
      ip: req.ip,
      userAgent: req.get('user-agent'),
    });
  } catch (err) {
    logger.warn(`Audit write failed for ${action}: ${err.message}`);
  }
};

export default recordAudit;
