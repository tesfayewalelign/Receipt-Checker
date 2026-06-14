import { Request, Response } from "express";
import { getKpisService, getProfile } from "./dashboard.service";
import { auth } from "../../lib/auth";
import { prisma } from "../../lib/prisma";
import { getOverviewService } from "./dashboard.service";
/* ───────────────── KPI ───────────────── */
export const getKpis = async (_req: Request, res: Response) => {
  try {
    const data = await getKpisService();
    res.json(data);
  } catch (error) {
    res.status(500).json({ message: "Server error" });
  }
};

/* ───────────────── GET PROFILE ───────────────── */
export const handleGetProfile = async (req: Request, res: Response) => {
  try {
    const session = await auth.api.getSession({
      headers: new Headers(req.headers as any),
    });

    if (!session?.user?.id) {
      return res.status(401).json({ message: "Unauthorized" });
    }

    const profile = await prisma.user.findUnique({
      where: { id: session.user.id },
      select: {
        id: true,
        name: true,
        email: true,
        companyName: true,
        image: true,
      },
    });

    return res.json(profile);
  } catch (err) {
    return res.status(500).json({ message: "Error fetching profile" });
  }
};

/* ───────────────── UPDATE PROFILE ───────────────── */
export const handleUpdateProfile = async (req: Request, res: Response) => {
  try {
    const session = await auth.api.getSession({
      headers: new Headers(req.headers as any),
    });

    if (!session?.user?.id) {
      return res.status(401).json({ message: "Unauthorized" });
    }

    const { name, companyName, image } = req.body;

    if (!name) {
      return res.status(400).json({ message: "Name is required" });
    }

    const updated = await prisma.user.update({
      where: { id: session.user.id },
      data: {
        name,
        companyName: companyName ?? "",
        image: image ?? "",
      },
    });

    return res.json(updated);
  } catch (err) {
    return res.status(500).json({ message: "Profile update failed" });
  }
};

/* ───────────────── CHANGE PASSWORD ───────────────── */
export const changePassword = async (req: Request, res: Response) => {
  try {
    const session = await auth.api.getSession({
      headers: new Headers(req.headers as any),
    });

    if (!session?.user?.id) {
      return res.status(401).json({
        success: false,
        message: "Unauthorized",
      });
    }

    const { currentPassword, newPassword } = req.body;

    if (!currentPassword || !newPassword) {
      return res.status(400).json({
        success: false,
        message: "Missing password fields",
      });
    }

    if (newPassword.length < 6) {
      return res.status(400).json({
        success: false,
        message: "Password too short",
      });
    }

    await auth.api.changePassword({
      headers: new Headers(req.headers as any),
      body: {
        currentPassword,
        newPassword,
      },
    });

    return res.json({
      success: true,
      message: "Password updated successfully",
    });
  } catch (err: any) {
    return res.status(400).json({
      success: false,
      message: err?.message || "Password change failed",
    });
  }
};
export const getOverview = async (req: any, res: Response) => {
  try {
    const userId = req.user.id;

    const data = await getOverviewService(userId);

    res.json(data);
  } catch (error) {
    console.error(error);

    res.status(500).json({
      success: false,
      message: "Failed to load dashboard",
    });
  }
};
