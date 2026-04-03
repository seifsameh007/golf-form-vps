const router = require('express').Router();
const Request = require('../models/Request');
const Visit = require('../models/Visit');
const { isAdmin } = require('../middleware/auth');

// Submit a new form request (public)
router.post('/requests', async (req, res) => {
  try {
    const { projectId, rooms, name, phone, hasWhatsApp, whatsappNumber, email, jobTitle, preferredDay, preferredTime } = req.body;

    if (!rooms || !name || !phone || !preferredDay || !preferredTime) {
      return res.status(400).json({ error: 'جميع الحقول المطلوبة يجب ملؤها' });
    }

    const newRequest = await Request.create({
      project: projectId || undefined,
      rooms,
      name,
      phone,
      hasWhatsApp: hasWhatsApp !== false && hasWhatsApp !== 'false',
      whatsappNumber: whatsappNumber || '',
      email: email || '',
      jobTitle: jobTitle || '',
      preferredDay,
      preferredTime,
      status: 'قيد المراجعة'
    });

    // Emit real-time notification to admins
    req.app.get('io').emit('new_request', newRequest);

    res.status(201).json({ success: true, message: 'تم إرسال الطلب بنجاح', request: newRequest });
  } catch (error) {
    console.error('Request creation error:', error);
    res.status(500).json({ error: 'حدث خطأ أثناء إرسال الطلب' });
  }
});

// Get all requests (admin only)
router.get('/requests', isAdmin, async (req, res) => {
  try {
    const { status, search, page = 1, limit = 20, isTrash = 'false' } = req.query;
    const query = { isTrash: isTrash === 'true' };

    if (status && status !== 'الكل' && isTrash !== 'true') {
      query.status = status;
    }

    if (search) {
      query.$or = [
        { name: { $regex: search, $options: 'i' } },
        { phone: { $regex: search, $options: 'i' } },
        { email: { $regex: search, $options: 'i' } }
      ];
    }

    const total = await Request.countDocuments(query);
    const requests = await Request.find(query)
      .populate('project')
      .sort({ createdAt: -1 })
      .skip((page - 1) * limit)
      .limit(parseInt(limit));

    res.json({
      requests,
      total,
      pages: Math.ceil(total / limit),
      currentPage: parseInt(page)
    });
  } catch (error) {
    console.error('Fetch requests error:', error);
    res.status(500).json({ error: 'حدث خطأ أثناء جلب الطلبات' });
  }
});

// Update request status (admin only)
router.patch('/requests/:id/status', isAdmin, async (req, res) => {
  try {
    const { status } = req.body;
    const validStatuses = ['قيد المراجعة', 'اشتري', 'لم يشتري'];

    if (!validStatuses.includes(status)) {
      return res.status(400).json({ error: 'حالة غير صالحة' });
    }

    const request = await Request.findByIdAndUpdate(
      req.params.id,
      { status },
      { new: true }
    );

    if (!request) {
      return res.status(404).json({ error: 'الطلب غير موجود' });
    }

    res.json({ success: true, request });
  } catch (error) {
    console.error('Update status error:', error);
    res.status(500).json({ error: 'حدث خطأ أثناء تحديث الحالة' });
  }
});

// Delete request (admin only)
router.delete('/requests/:id', isAdmin, async (req, res) => {
  try {
    const { hard } = req.query;
    let request;
    if (hard === 'true') {
      request = await Request.findByIdAndDelete(req.params.id);
    } else {
      request = await Request.findByIdAndUpdate(req.params.id, { isTrash: true }, { new: true });
    }
    
    if (!request) {
      return res.status(404).json({ error: 'الطلب غير موجود' });
    }
    res.json({ success: true, message: hard === 'true' ? 'تم حذف الطلب نهائياً' : 'تم نقل الطلب سلة المحذوفات' });
  } catch (error) {
    res.status(500).json({ error: 'حدث خطأ أثناء حذف الطلب' });
  }
});

// Restore request from trash (admin only)
router.patch('/requests/:id/restore', isAdmin, async (req, res) => {
  try {
    const request = await Request.findByIdAndUpdate(
      req.params.id,
      { isTrash: false },
      { new: true }
    );

    if (!request) {
      return res.status(404).json({ error: 'الطلب غير موجود' });
    }

    res.json({ success: true, request });
  } catch (error) {
    console.error('Restore error:', error);
    res.status(500).json({ error: 'حدث خطأ أثناء استرجاع الطلب' });
  }
});

// Get dashboard stats (admin only)
router.get('/stats', isAdmin, async (req, res) => {
  try {
    const totalRequests = await Request.countDocuments();
    const bought = await Request.countDocuments({ status: 'اشتري' });
    const notBought = await Request.countDocuments({ status: 'لم يشتري' });
    const pending = await Request.countDocuments({ status: 'قيد المراجعة' });

    // Total visits
    const visitAgg = await Visit.aggregate([
      { $group: { _id: null, total: { $sum: '$count' } } }
    ]);
    const totalVisits = visitAgg.length > 0 ? visitAgg[0].total : 0;

    res.json({
      totalVisits,
      totalRequests,
      bought,
      notBought,
      pending
    });
  } catch (error) {
    console.error('Stats error:', error);
    res.status(500).json({ error: 'حدث خطأ أثناء جلب الإحصائيات' });
  }
});

// Get visit chart data (admin only)
router.get('/visits/chart', isAdmin, async (req, res) => {
  try {
    const days = parseInt(req.query.days) || 7;
    const startDate = new Date();
    startDate.setDate(startDate.getDate() - days);
    startDate.setHours(0, 0, 0, 0);

    const visits = await Visit.aggregate([
      { $match: { date: { $gte: startDate } } },
      {
        $group: {
          _id: { $dateToString: { format: '%Y-%m-%d', date: '$date' } },
          total: { $sum: '$count' }
        }
      },
      { $sort: { _id: 1 } }
    ]);

    // Fill in missing days with 0
    const result = [];
    for (let i = 0; i < days; i++) {
      const d = new Date(startDate);
      d.setDate(d.getDate() + i);
      const dateStr = d.toISOString().split('T')[0];
      const found = visits.find(v => v._id === dateStr);
      result.push({
        date: dateStr,
        count: found ? found.total : 0
      });
    }

    res.json(result);
  } catch (error) {
    console.error('Chart data error:', error);
    res.status(500).json({ error: 'حدث خطأ أثناء جلب بيانات الشارت' });
  }
});

// Add a new project (admin only)
router.post('/projects', isAdmin, async (req, res) => {
  try {
    const { name, rooms } = req.body;
    if (!name || !rooms) return res.status(400).json({ error: 'البيانات غير مكتملة' });
    
    // Generate simple slug from name (replace spaces with dashes, lowercase)
    const slug = name.trim().toLowerCase().replace(/\s+/g, '-').replace(/[^a-z0-9-]/g, '');
    const newSlug = slug || 'project-' + Date.now(); // fallback for purely arabic names without english letters
    
    // Fallback for arabic slugs to just use random ID or keep original space-replaced
    const finalSlug = name.trim().replace(/\s+/g, '-');
    
    const Project = require('../models/Project');
    // Check uniqueness
    let slugToUse = finalSlug;
    const exists = await Project.findOne({ slug: slugToUse });
    if (exists) slugToUse = slugToUse + '-' + Date.now();
    
    const roomsArray = typeof rooms === 'string' ? rooms.split(/[-،,]/).map(r => r.trim()).filter(r => r) : rooms;
    
    const project = await Project.create({ name, slug: slugToUse, rooms: roomsArray });
    res.status(201).json({ success: true, project });
  } catch (error) {
    console.error('Project creation error:', error);
    res.status(500).json({ error: 'حدث خطأ أثناء إنشاء المشروع' });
  }
});

// Edit project (admin only)
router.put('/projects/:id', isAdmin, async (req, res) => {
  try {
    const { name, rooms } = req.body;
    if (!name || !rooms) return res.status(400).json({ error: 'البيانات غير مكتملة' });
    
    const Project = require('../models/Project');
    
    // Parse rooms appropriately (can be string or array)
    const roomsArray = Array.isArray(rooms) 
      ? rooms.map(r => r.trim()).filter(r => r) 
      : rooms.split(/[-،,]/).map(r => r.trim()).filter(r => r);
      
    // Update name and rooms, do NOT update slug to avoid breaking existing links
    const project = await Project.findByIdAndUpdate(req.params.id, {
      name: name.trim(),
      rooms: roomsArray
    }, { new: true });
    
    if (!project) return res.status(404).json({ error: 'المشروع غير موجود' });
    
    res.json({ success: true, project });
  } catch (error) {
    console.error('Project update error:', error);
    res.status(500).json({ error: 'حدث خطأ أثناء تحديث المشروع' });
  }
});

// Delete project (admin only)
router.delete('/projects/:id', isAdmin, async (req, res) => {
  try {
    const Project = require('../models/Project');
    const project = await Project.findByIdAndDelete(req.params.id);
    if (!project) return res.status(404).json({ error: 'المشروع غير موجود' });
    res.json({ success: true });
  } catch (error) {
    console.error('Project deletion error:', error);
    res.status(500).json({ error: 'حدث خطأ أثناء حذف المشروع' });
  }
});

module.exports = router;
