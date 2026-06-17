const usersService = require('../services/users.service');

exports.list = async (req, res, next) => { try { const data = await usersService.list(); res.json(data); } catch (e) { next(e); } };
exports.getById = async (req, res, next) => {
	try {
		if (req.user.role !== 'ADMIN' && String(req.user.id) !== String(req.params.id)) {
			return res.status(403).json({ message: 'Acces refuse' });
		}
		const u = await usersService.getById(req.params.id);
		if (!u) return res.status(404).json({ message: 'Utilisateur introuvable' });
		res.json(u);
	} catch (e) { next(e); }
};

exports.updateRole = async (req, res, next) => {
	try {
		const { id } = req.params;
		const { role } = req.body;
		if (!role || (role !== 'USER' && role !== 'ADMIN')) return res.status(400).json({ message: 'Invalid role' });
		await usersService.updateRole(id, role);
		res.json({ message: 'Role updated' });
	} catch (e) { next(e); }
};
