# KB-ACCT-01 — Gestion des Comptes et Accès

**Catégorie** : Compte et Accès  
**Version** : 1.5 | **Mise à jour** : 2026-02

---

## Problèmes Couverts

- Mot de passe oublié (Windows, Outlook, Applications)
- Compte utilisateur bloqué / verrouillé
- Impossibilité de se connecter au poste de travail
- Demande de création ou suppression de compte
- Problèmes de droits d'accès aux dossiers partagés

---

## Réinitialisation Mot de Passe

### Procédure Self-Service (Priorité : Utilisateur)
```
1. Aller sur : https://password.ispm.fr
2. Saisir son identifiant ISPM (ex: m.dupont)
3. Répondre aux questions de sécurité enregistrées
4. Choisir un nouveau mot de passe
   Règles : 12 caractères min, 1 maj, 1 chiffre, 1 caractère spécial
```

### Si Self-Service Inaccessible (Compte bloqué)
- **Escalade P3** → support_n1 (Helpdesk)
- Le technicien vérifiera l'identité et déverrouillera le compte AD
- Délai : 30 min en heures ouvrables

---

## Comptes Windows AD

### Compte bloqué (5 tentatives échouées)
```
Technicien : ADUC → Propriétés → Compte → Décocher "Compte verrouillé"
PowerShell : Unlock-ADAccount -Identity "m.dupont"
```

### Compte expiré
```
PowerShell : Set-ADAccountExpiration -Identity "m.dupont" -DateTime "31/12/2026"
```

### Réinitialisation mot de passe (Technicien)
```
PowerShell : Set-ADAccountPassword -Identity "m.dupont" -Reset -NewPassword (Read-Host -AsSecureString)
             Set-ADUser -Identity "m.dupont" -ChangePasswordAtLogon $true
```

> ⚠️ **ATTENTION** : Toute réinitialisation de mot de passe admin requiert validation_humaine_requise = true

---

## Droits d'Accès Dossiers Partagés

### Vérification des droits actuels
```
icacls "\\serveur\partage\dossier"
```

### Demande d'accès
1. Utilisateur soumet une demande via ticket
2. Validation par le responsable de département
3. Technicien applique les droits (NTFS + partage)

---

## Catégorisation des Demandes

| Type | Priorité | Équipe |
|------|----------|--------|
| Mot de passe oublié bloquant | P3 | support_n1 |
| Compte bloqué | P3 | support_n1 |
| Droits d'accès | P4 | support_n1 |
| Création compte nouveau employé | P3 | support_n1 + RH |
| Compte admin compromis | P1 | securite_informatique |

---

**Source** : Procédures ISPM DSI — KB-ACCT-01
