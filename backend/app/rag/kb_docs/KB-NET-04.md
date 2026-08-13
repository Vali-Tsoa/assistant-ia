# KB-NET-04 — VPN et Accès Distant

**Catégorie** : Réseau et Connectivité — VPN  
**Version** : 2.0 | **Mise à jour** : 2026-03

---

## Problèmes Couverts

- Impossible de se connecter au VPN ISPM
- VPN connecté mais impossible d'accéder aux ressources internes
- Déconnexions VPN fréquentes
- Erreur "Timeout" ou "Authentication Failed"

---

## Pré-requis VPN ISPM

- Client VPN : Cisco AnyConnect v4.10+
- URL serveur : vpn.ispm.fr
- Authentification : Identifiants ISPM + Certificat numérique
- OS supportés : Windows 10/11, macOS 12+, Ubuntu 22.04+

---

## Diagnostic par Type d'Erreur

### Erreur "Timeout / Connection Refused"
**Causes probables :**
1. Serveur VPN en maintenance
2. Pare-feu local bloquant le port 443/UDP 4500
3. Problème réseau côté utilisateur

**Actions :**
```
1. Vérifier statut serveur VPN : vpn-status.ispm.fr
2. Tester depuis un autre réseau (partage 4G)
3. Désactiver temporairement le pare-feu local pour tester
4. Si persistant → Escalade P3 support_n2
```

### Erreur "Authentication Failed"
**Causes probables :**
1. Identifiants expirés ou mot de passe changé
2. Certificat numérique expiré
3. Compte bloqué (trop de tentatives)

**Actions :**
```
1. Vérifier identifiants sur portail ISPM : portail.ispm.fr
2. Renouveler certificat : portail.ispm.fr/certificat
3. Si compte bloqué → Escalade P3 support_n1 (déverrouillage AD)
```

### VPN connecté mais ressources inaccessibles
**Causes :** Split tunneling mal configuré, DNS VPN non résolu  
**Actions :**
```
1. Déconnecter et reconnecter le VPN
2. Vider cache DNS : ipconfig /flushdns
3. Tester par IP directe plutôt que nom de domaine
```

---

## Contacts Équipes

| Problème | Équipe | Priorité |
|----------|--------|----------|
| Serveur VPN down | infrastructure_reseau | P1/P2 |
| Auth / Compte | support_n1 | P3 |
| Configuration client | support_n2 | P3/P4 |

---

**Source** : Procédures ISPM DSI — KB-NET-04
