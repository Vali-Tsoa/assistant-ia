# KB-NET-01 — Pannes Réseau et Connectivité

**Catégorie** : Réseau et Connectivité  
**Version** : 1.2 | **Mise à jour** : 2026-01

---

## Symptômes Couverts

- Perte totale de connexion réseau filaire ou Wi-Fi
- Impossible d'accéder à Internet depuis un poste
- Panne réseau sur un étage entier ou une zone
- Switch ou routeur qui ne répond plus

---

## Étapes de Diagnostic Niveau 1

### 1. Vérification rapide (utilisateur)
```
1. Redémarrer le poste de travail
2. Vérifier que le câble réseau est bien branché (LED verte sur la prise murale)
3. Tester sur un autre poste du même bureau
4. Vérifier si le problème est général (Wi-Fi + filaire) ou uniquement filaire
```

### 2. Indicateurs de panne matérielle
- Si LED éteinte sur prise murale → Switch potentiellement en panne
- Si tous les postes d'un étage sont touchés → Switch d'étage défaillant
- Si seul un poste est touché → Problème carte réseau ou câble

---

## Actions Correctives

### Panne isolée (1 poste)
1. Tester un autre câble RJ45
2. Vérifier paramètres IP (ipconfig /all sous Windows)
3. Réinitialiser la pile TCP/IP : `netsh int ip reset`
4. Si persistant → Escalade niveau 2 (Infra Réseau)

### Panne d'étage (switch)
1. **Escalade immédiate P2** → Équipe Infrastructure Réseau
2. Localiser le local technique de l'étage
3. Vérifier l'alimentation du switch (voyant power)
4. Redémarrage switch si accès disponible

### Panne totale (backbone)
1. **Escalade P1 immédiate** → Équipe Infra + DSI
2. Activation du plan de continuité réseau

---

## Équipes de Résolution

| Priorité | Équipe | Délai Max |
|----------|--------|-----------|
| P1 | infrastructure_reseau + DSI | 30 min |
| P2 | infrastructure_reseau | 2h |
| P3 | support_n2 | 4h |
| P4 | support_n1 | 24h |

---

## Outils de Vérification (Technicien)
- `ping 8.8.8.8` — Test connectivité externe
- `tracert 8.8.8.8` — Trace de la route réseau
- `ipconfig /all` — Configuration IP complète
- Interface d'administration switch : http://192.168.1.1

---

**Source** : Procédures ISPM DSI — KB-NET-01
