
import { Branch, User, Attendance } from '../types';

/**
 * REVISED COMMISSION LOGIC:
 * 
 * 1. Global Pool Calculation:
 *    - omzet >= targetMax -> 0.4%
 *    - omzet >= targetMin -> 0.2%
 *    - else -> 0%
 * 
 * 2. Presence Cases (Max 2 CS per branch):
 *    - Combinations: (0.5:0.5) or (0.75:0.25)
 *    
 *    Case A: Both Present (Status > 0)
 *      Share = GlobalPool * factor * attendance_status
 *    
 *    Case B: Only One Present
 *      If Present CS Factor is 0.75 or 0.50:
 *         Share = GlobalPool * 1.0 * attendance_status
 *      If Present CS Factor is 0.25:
 *         Share = GlobalPool * 0.5 * attendance_status
 * 
 * 3. Half-day:
 *    The attendance_status (0.5) directly reduces the share.
 */

export const validateCSFactors = (csUsers: User[]): boolean => {
  if (csUsers.length > 2) return false;
  if (csUsers.length === 0) return true;
  
  const factors = csUsers.map(u => u.faktorPengali || 0).sort((a, b) => b - a);
  
  if (factors.length === 1) {
    return [0.75, 0.50, 0.25].includes(factors[0]);
  }
  
  // Valid pairs: (0.5, 0.5) or (0.75, 0.25)
  const is5050 = factors[0] === 0.5 && factors[1] === 0.5;
  const is7525 = factors[0] === 0.75 && factors[1] === 0.25;
  
  return is5050 || is7525;
};

export const calculateDailyCommissions = (
  branch: Branch,
  totalOmzet: number,
  csUsers: User[],
  attendances: Attendance[]
) => {
  // Validate factors first
  if (!validateCSFactors(csUsers)) {
    console.error("Invalid CS Factor combination for branch", branch.name);
    return {};
  }

  let globalRate = 0;
  if (totalOmzet >= branch.targetMax) {
    globalRate = 0.004;
  } else if (totalOmzet >= branch.targetMin) {
    globalRate = 0.002;
  }

  const globalPool = totalOmzet * globalRate;
  const results: Record<string, number> = {};

  const presentCS = csUsers.filter(u => {
    const att = attendances.find(a => a.userId === u.id);
    return att && att.status > 0;
  });

  if (presentCS.length === 2) {
    // Case A: Both present
    csUsers.forEach(u => {
      const att = attendances.find(a => a.userId === u.id);
      const status = att ? att.status : 0;
      const factor = u.faktorPengali || 0;
      results[u.id] = Math.floor(globalPool * factor * status);
    });
  } else if (presentCS.length === 1) {
    // Case B: Only one present
    const luckyCS = presentCS[0];
    const att = attendances.find(a => a.userId === luckyCS.id);
    const status = att ? att.status : 0;
    const factor = luckyCS.faktorPengali || 0;
    
    let effectiveFactor = 0;
    if (factor === 0.75 || factor === 0.50) {
      effectiveFactor = 1.0;
    } else if (factor === 0.25) {
      effectiveFactor = 0.5;
    }

    results[luckyCS.id] = Math.floor(globalPool * effectiveFactor * status);
    
    // Set absent CS to 0
    csUsers.forEach(u => {
      if (u.id !== luckyCS.id) results[u.id] = 0;
    });
  } else {
    // None present
    csUsers.forEach(u => results[u.id] = 0);
  }

  return results;
};
