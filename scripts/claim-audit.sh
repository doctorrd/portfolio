#!/usr/bin/env bash
# Fails if any internal-only figure, template placeholder or removed-venture term appears in published pages.
# Source of rules: Master Career Report v0.5, Appendix B (public wording) and E.3 (do-not-overstate).
set -u
cd "$(dirname "$0")/.."
FILES=$(ls *.html work/*.html assets/js/viz/*.js script.js)
fail=0
check () {
  if grep -niE "$1" $FILES >/dev/null; then
    echo "✕ $2"; grep -niE "$1" $FILES | head -5; fail=1
  fi
}
check '5,?943|4,?735|3,?271|14,?000 |[^0-9.]849[^0-9]|362 (records|addresses)|256 (confident|match)|115[- ]location|40 ?km|99 extreme' 'Internal-only exact figure found'
check 'Your Name|you@yourdomain|XXX-XXXX' 'Template placeholder found'
check 'mango|food.import|e-commerce|whatsapp|instagram|reels|brampton' 'Removed venture content found'
check 'recruited [0-9]|generated applicants|cut project time|fully automated bilingual' 'Overstated wording found'
[ $fail -eq 0 ] && echo "✓ Claim audit passed"
exit $fail
