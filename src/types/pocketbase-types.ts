/**
* This file was @generated using pocketbase-typegen
*/

import type PocketBase from 'pocketbase'
import type { RecordService } from 'pocketbase'

export const Collections = {
	Authorigins: "_authOrigins",
	Externalauths: "_externalAuths",
	Mfas: "_mfas",
	Otps: "_otps",
	Superusers: "_superusers",
	KalenderHijriyah: "kalender_hijriyah",
	Master: "master",
	PengurusSantri: "pengurus_santri",
	PeriodeRambut: "periode_rambut",
	RiwayatSetorRambut: "riwayat_setor_rambut",
	Users: "users",
	WajibSetorRambut: "wajib_setor_rambut",
} as const
export type Collections = typeof Collections[keyof typeof Collections]

// Alias types for improved usability
export type IsoDateString = string
export type IsoAutoDateString = string & { readonly autodate: unique symbol }
export type RecordIdString = string
export type FileNameString = string & { readonly filename: unique symbol }
export type HTMLString = string

type ExpandType<T> = unknown extends T
	? T extends unknown
		? { expand?: unknown }
		: { expand: T }
	: { expand: T }

// System fields
export type BaseSystemFields<T = unknown> = {
	id: RecordIdString
	collectionId: string
	collectionName: Collections
} & ExpandType<T>

export type AuthSystemFields<T = unknown> = {
	email: string
	emailVisibility: boolean
	username: string
	verified: boolean
} & BaseSystemFields<T>

// Record types for each collection

export type AuthoriginsRecord = {
	collectionRef: string
	created: IsoAutoDateString
	fingerprint: string
	id: string
	recordRef: string
	updated: IsoAutoDateString
}

export type ExternalauthsRecord = {
	collectionRef: string
	created: IsoAutoDateString
	id: string
	provider: string
	providerId: string
	recordRef: string
	updated: IsoAutoDateString
}

export type MfasRecord = {
	collectionRef: string
	created: IsoAutoDateString
	id: string
	method: string
	recordRef: string
	updated: IsoAutoDateString
}

export type OtpsRecord = {
	collectionRef: string
	created: IsoAutoDateString
	id: string
	password: string
	recordRef: string
	sentTo?: string
	updated: IsoAutoDateString
}

export type SuperusersRecord = {
	created: IsoAutoDateString
	email: string
	emailVisibility?: boolean
	id: string
	password: string
	tokenKey: string
	updated: IsoAutoDateString
	verified?: boolean
}

export const KalenderHijriyahBulanHijriNamaOptions = {
	"Muharram": "Muharram",
	"Safar": "Safar",
	"Rabi'ul Awal": "Rabi'ul Awal",
	"Rabi'ul Akhir": "Rabi'ul Akhir",
	"Jumadil Ula": "Jumadil Ula",
	"Jumadil Akhir": "Jumadil Akhir",
	"Rajab": "Rajab",
	"Sya'ban": "Sya'ban",
	"Ramadhan": "Ramadhan",
	"Syawwal": "Syawwal",
	"Dzulqa'dah": "Dzulqa'dah",
	"Dzulhijjah": "Dzulhijjah",
} as const
export type KalenderHijriyahBulanHijriNamaOptions = typeof KalenderHijriyahBulanHijriNamaOptions[keyof typeof KalenderHijriyahBulanHijriNamaOptions]
export type KalenderHijriyahRecord = {
	bulan_hijri_angka?: number
	bulan_hijri_nama?: KalenderHijriyahBulanHijriNamaOptions
	created: IsoAutoDateString
	id: string
	string_hijri: string
	tahun_hijri?: number
	tanggal_hijri?: number
	tanggal_masehi: IsoDateString
	updated: IsoAutoDateString
}

export type MasterRecord = {
	alasan_update_status?: string
	created: IsoAutoDateString
	desa?: string
	domisili?: string
	foto?: FileNameString
	foto_subfolder?: string
	id: string
	id_pps: string
	kabupaten?: string
	kecamatan?: string
	kelas?: string
	keterangan_update_domisi?: string
	kk?: string
	kontak_wali?: string
	nama?: string
	nama_akte?: string
	nama_ayah?: string
	nama_ibu?: string
	nama_wali?: string
	nik?: string
	nik_ayah?: string
	nik_ibu?: string
	nik_wali?: string
	nisn?: string
	noabsen?: string
	nomor_daftar?: string
	provinsi?: string
	ruang_kelas?: string
	status_aktif?: boolean
	status_domisili?: string
	tanggal_daftar?: string
	tingkatan?: string
	updated: IsoAutoDateString
}

export type PengurusSantriRecord = {
	created: IsoAutoDateString
	id: string
	id_pps: string
	jabatan?: string
	santri?: RecordIdString
	status_aktif?: boolean
	updated: IsoAutoDateString
}

export const PeriodeRambutStatusPeriodeOptions = {
	"draft": "draft",
	"aktif": "aktif",
	"selesai": "selesai",
} as const
export type PeriodeRambutStatusPeriodeOptions = typeof PeriodeRambutStatusPeriodeOptions[keyof typeof PeriodeRambutStatusPeriodeOptions]
export type PeriodeRambutRecord = {
	bulan_hijriyah_angka?: number
	created: IsoAutoDateString
	id: string
	nama_periode: string
	status_periode?: PeriodeRambutStatusPeriodeOptions
	tahun_hijriyah?: number
	tanggal_mulai: IsoDateString
	tanggal_selesai: IsoDateString
	updated: IsoAutoDateString
}

export type RiwayatSetorRambutRecord = {
	catatan?: string
	created: IsoAutoDateString
	id: string
	id_pps: string
	periode?: RecordIdString
	petugas_eksekutor?: RecordIdString
	santri?: RecordIdString
	tanggal_setor: IsoDateString
	updated: IsoAutoDateString
	wajib_setor?: RecordIdString
	waktu_wis: string
}

export const UsersRoleOptions = {
	"admin": "admin",
	"umum": "umum",
	"rambut": "rambut",
	"admin_rambut": "admin_rambut",
} as const
export type UsersRoleOptions = typeof UsersRoleOptions[keyof typeof UsersRoleOptions]
export type UsersRecord = {
	avatar?: FileNameString
	created: IsoAutoDateString
	email?: string
	emailVisibility?: boolean
	id: string
	name: string
	password: string
	role: UsersRoleOptions
	status?: boolean
	tokenKey: string
	updated: IsoAutoDateString
	username: string
	verified?: boolean
}

export const WajibSetorRambutKategoriWajibOptions = {
	"aliyah": "aliyah",
	"kuliah_syariah": "kuliah_syariah",
	"pengurus_petugas": "pengurus_petugas",
} as const
export type WajibSetorRambutKategoriWajibOptions = typeof WajibSetorRambutKategoriWajibOptions[keyof typeof WajibSetorRambutKategoriWajibOptions]

export const WajibSetorRambutStatusSetorOptions = {
	"belum": "belum",
	"sudah": "sudah",
	"dispensasi": "dispensasi",
} as const
export type WajibSetorRambutStatusSetorOptions = typeof WajibSetorRambutStatusSetorOptions[keyof typeof WajibSetorRambutStatusSetorOptions]
export type WajibSetorRambutRecord = {
	created: IsoAutoDateString
	id: string
	id_pps: string
	kategori_wajib?: WajibSetorRambutKategoriWajibOptions
	periode?: RecordIdString
	santri?: RecordIdString
	status_setor?: WajibSetorRambutStatusSetorOptions
	tanggal_setor?: IsoDateString
	updated: IsoAutoDateString
}

// Response types include system fields and match responses from the PocketBase API
export type AuthoriginsResponse<Texpand = unknown> = Required<AuthoriginsRecord> & BaseSystemFields<Texpand>
export type ExternalauthsResponse<Texpand = unknown> = Required<ExternalauthsRecord> & BaseSystemFields<Texpand>
export type MfasResponse<Texpand = unknown> = Required<MfasRecord> & BaseSystemFields<Texpand>
export type OtpsResponse<Texpand = unknown> = Required<OtpsRecord> & BaseSystemFields<Texpand>
export type SuperusersResponse<Texpand = unknown> = Required<SuperusersRecord> & AuthSystemFields<Texpand>
export type KalenderHijriyahResponse<Texpand = unknown> = Required<KalenderHijriyahRecord> & BaseSystemFields<Texpand>
export type MasterResponse<Texpand = unknown> = Required<MasterRecord> & BaseSystemFields<Texpand>
export type PengurusSantriResponse<Texpand = unknown> = Required<PengurusSantriRecord> & BaseSystemFields<Texpand>
export type PeriodeRambutResponse<Texpand = unknown> = Required<PeriodeRambutRecord> & BaseSystemFields<Texpand>
export type RiwayatSetorRambutResponse<Texpand = unknown> = Required<RiwayatSetorRambutRecord> & BaseSystemFields<Texpand>
export type UsersResponse<Texpand = unknown> = Required<UsersRecord> & AuthSystemFields<Texpand>
export type WajibSetorRambutResponse<Texpand = unknown> = Required<WajibSetorRambutRecord> & BaseSystemFields<Texpand>

// Types containing all Records and Responses, useful for creating typing helper functions

export type CollectionRecords = {
	_authOrigins: AuthoriginsRecord
	_externalAuths: ExternalauthsRecord
	_mfas: MfasRecord
	_otps: OtpsRecord
	_superusers: SuperusersRecord
	kalender_hijriyah: KalenderHijriyahRecord
	master: MasterRecord
	pengurus_santri: PengurusSantriRecord
	periode_rambut: PeriodeRambutRecord
	riwayat_setor_rambut: RiwayatSetorRambutRecord
	users: UsersRecord
	wajib_setor_rambut: WajibSetorRambutRecord
}

export type CollectionResponses = {
	_authOrigins: AuthoriginsResponse
	_externalAuths: ExternalauthsResponse
	_mfas: MfasResponse
	_otps: OtpsResponse
	_superusers: SuperusersResponse
	kalender_hijriyah: KalenderHijriyahResponse
	master: MasterResponse
	pengurus_santri: PengurusSantriResponse
	periode_rambut: PeriodeRambutResponse
	riwayat_setor_rambut: RiwayatSetorRambutResponse
	users: UsersResponse
	wajib_setor_rambut: WajibSetorRambutResponse
}

// Utility types for create/update operations

type ProcessCreateAndUpdateFields<T> = Omit<{
	// Omit AutoDate fields
	[K in keyof T as Extract<T[K], IsoAutoDateString> extends never ? K : never]: 
		// Convert FileNameString to File
		T[K] extends infer U ? 
			U extends (FileNameString | FileNameString[]) ? 
				U extends any[] ? File[] : File 
			: U
		: never
}, 'id'>

// Create type for Auth collections
export type CreateAuth<T> = {
	id?: RecordIdString
	email: string
	emailVisibility?: boolean
	password: string
	passwordConfirm: string
	verified?: boolean
} & ProcessCreateAndUpdateFields<T>

// Create type for Base collections
export type CreateBase<T> = {
	id?: RecordIdString
} & ProcessCreateAndUpdateFields<T>

// Update type for Auth collections
export type UpdateAuth<T> = Partial<
	Omit<ProcessCreateAndUpdateFields<T>, keyof AuthSystemFields>
> & {
	email?: string
	emailVisibility?: boolean
	oldPassword?: string
	password?: string
	passwordConfirm?: string
	verified?: boolean
}

// Update type for Base collections
export type UpdateBase<T> = Partial<
	Omit<ProcessCreateAndUpdateFields<T>, keyof BaseSystemFields>
>

// Get the correct create type for any collection
export type Create<T extends keyof CollectionResponses> =
	CollectionResponses[T] extends AuthSystemFields
		? CreateAuth<CollectionRecords[T]>
		: CreateBase<CollectionRecords[T]>

// Get the correct update type for any collection
export type Update<T extends keyof CollectionResponses> =
	CollectionResponses[T] extends AuthSystemFields
		? UpdateAuth<CollectionRecords[T]>
		: UpdateBase<CollectionRecords[T]>

// Type for usage with type asserted PocketBase instance
// https://github.com/pocketbase/js-sdk#specify-typescript-definitions

export type TypedPocketBase = {
	collection<T extends keyof CollectionResponses>(
		idOrName: T
	): RecordService<CollectionResponses[T]>
} & PocketBase
